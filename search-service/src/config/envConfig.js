const config = {
  port: process.env.SEARCH_SERVICE_PORT || 3004,
  mongodbUri: process.env.SEARCH_SERVICE_MONGODB_URI,
  jwtSecret: process.env.SEARCH_SERVICE_JWT_SECRET,
  nodeEnv: process.env.SEARCH_SERVICE_NODE_ENV || 'development',
  redisUrl: process.env.SEARCH_SERVICE_REDIS_URL,
  rabbitmqUrl: process.env.SEARCH_SERVICE_RABBITMQ_URL,
};

module.exports = config;
