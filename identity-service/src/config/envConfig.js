const config = {
  port: process.env.IDENTITY_SERVICE_PORT || 3001,
  mongodbUri: process.env.IDENTITY_SERVICE_MONGODB_URI,
  jwtSecret: process.env.IDENTITY_SERVICE_JWT_SECRET,
  nodeEnv: process.env.IDENTITY_SERVICE_NODE_ENV || 'development',
  redisUrl: process.env.IDENTITY_SERVICE_REDIS_URL,
  rabbitmqUrl: process.env.IDENTITY_SERVICE_RABBITMQ_URL,
};

module.exports = config;
