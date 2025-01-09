require('dotenv').config();
const express = require('express');
const { configureCors } = require('./config/corsConfig')
const Redis = require('ioredis');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const logger = require('./utils/logger');


const app = express();
const PORT = process.env.PORT || 3000;
const redisClient = new Redis(process.env.REDIS_URL);

// middleware
app.use(helmet());
app.use(configureCors());
app.use(express.json());

// rate limiting

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

app.use(sensitiveEndpointLimiter);


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
