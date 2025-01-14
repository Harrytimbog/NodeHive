require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const express = require('express');
const helmet = require('helmet');
// const cors = require('cors');
const {configureCors} = require('./config/corsConfig');
const {globalErrorHandler} = require('./middleware/errorHandler')
const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require("ioredis");
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const postRoutes = require('./routes/postRoutes');

const app = express();
const PORT = process.env.PORT || 3002;


// Connect to database
mongoose.connect(process.env.MONGODB_URI).then(() => {
  logger.info('Connected to database');
}).catch((error) => {
  logger.error('Error connecting to database: ', error);
});

// Redis
const redisClient = new Redis(process.env.REDIS_URI);

// middleware
app.use(helmet());
app.use(configureCors());
app.use(express.json());


/// test endpoint to check if the service is running
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body: ${JSON.stringify(req.body)}`);
  next();
})


// rate limiter, DDOS protection
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 5, // 5 requests
  duration: 1, // per 1 second by IP
});

app.use((req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      logger.warn(`Rate limiter exceeded for IP: ${req.ip}`);
      res.status(429).json({ success: false, message: 'Too many requests' });
    });
});

// Ip based rate limiter for sensitive endpoints
const sensitiveEndpointLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: function (req, res) {
    logger.warn(`Senitive endpoint Rate limiter exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: 'Too many requests' });
   },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  })
});

// apply this sensitive endpoint limiter to sensitive endpoints
app.use('/api/posts', sensitiveEndpointLimiter)

// Routes

app.use('/api/posts', (req, res, next) => {
  // pass redis client to the request object for
  req.redisClient = redisClient;
  next();
}, postRoutes);

// error haandler

app.use(globalErrorHandler);


// start server
app.listen(process.env.PORT, () => {
  logger.info(`Post Service started on port ${process.env.PORT}`);
});


//Unhandled promise rejection

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
 });
