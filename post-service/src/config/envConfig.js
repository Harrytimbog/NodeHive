const config = {
  port: process.env.POST_SERVICE_PORT || 3002,
  mongodbUri: process.env.POST_SERVICE_MONGODB_URI,
  jwtSecret: process.env.POST_SERVICE_JWT_SECRET,
  nodeEnv: process.env.POST_SERVICE_NODE_ENV || 'development',
  redisUrl: process.env.POST_SERVICE_REDIS_URL,
  rabbitmqUrl: process.env.POST_SERVICE_RABBITMQ_URL,
};

module.exports = config;
