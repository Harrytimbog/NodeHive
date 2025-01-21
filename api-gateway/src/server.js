require('dotenv').config();
const express = require('express');
const { configureCors } = require('./config/corsConfig');
const Redis = require('ioredis');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const logger = require('./utils/logger');
const proxy = require('express-http-proxy');
const { globalErrorHandler } = require('./middleware/errorHandler');
const { validateToken } = require('./middleware/authMiddleware');
const { envConfig } = require('./config');


const app = express();

const { port,
  redisUrl,
  mongodbUri,
  identityServiceUrl,
  postServiceUrl,
  mediaServiceUrl,
  searchServiceUrl
} = envConfig;

const PORT = port;

const redisClient = new Redis(redisUrl);

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


// Proxy to the services

// e.g localhost:3000/v1/auth/register -> localhost:3001/api/auth/register
const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, '/api');
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    next(err);
  },
}

// setting up the proxy for the services
//// proxy to the identity service
app.use('/v1/auth', proxy(identityServiceUrl, {
  ...proxyOptions,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers["Content-Type"] = "application/json";
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(`Response received from Identity service: ${proxyRes.statusCode}`);
    return proxyResData;
  }
}));

//// Setting up proxy to the Post service
app.use('/v1/posts', validateToken, proxy(postServiceUrl, {
  ...proxyOptions,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers["Content-Type"] = "application/json";
    proxyReqOpts.headers['x-user-id'] = srcReq.user.userId; // pass the user id to the post service via

    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(`Response received from Post service: ${proxyRes.statusCode}`);
    return proxyResData;
  }
}))

//setting up proxy for our media service
app.use(
  "/v1/media",
  validateToken,
  proxy(mediaServiceUrl, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      if (!srcReq.headers["content-type"].startsWith("multipart/form-data")) {
        proxyReqOpts.headers["Content-Type"] = "application/json";
      }

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from media service: ${proxyRes.statusCode}`
      );

      return proxyResData;
    },
    parseReqBody: false,
  })
);

//// Setting up proxy to the Search service
app.use('/v1/search', validateToken, proxy(searchServiceUrl, {
  ...proxyOptions,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers["Content-Type"] = "application/json";
    proxyReqOpts.headers['x-user-id'] = srcReq.user.userId; // pass the user id to the post service via

    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(`Response received from Search service: ${proxyRes.statusCode}`);
    return proxyResData;
  }
}))

// Error Handler

app.use(globalErrorHandler);

// Start the server
app.listen(PORT, () => {
  logger.info(`API Gateway is running on port ${PORT}`);
  logger.info(`Identity service is running on port ${identityServiceUrl}`);
  logger.info(`Post service is running on port ${postServiceUrl}`);
  logger.info(`Media service is running on port ${mediaServiceUrl}`);
  logger.info(`Search service is running on port ${searchServiceUrl}`);
  logger.info(`Redis is running on port ${redisUrl}`);
});
