const config = {
  port: process.env.API_GATEWAY_PORT || 3000,
  nodeEnv: process.env.API_GATEWAY_NODE_ENV || 'development',
  identityServiceUrl: process.env.API_GATEWAY_IDENTITY_SERVICE_URL,
  postServiceUrl: process.env.API_GATEWAY_POST_SERVICE_URL,
  mediaServiceUrl: process.env.API_GATEWAY_MEDIA_SERVICE_URL,
  searchServiceUrl: process.env.API_GATEWAY_SEARCH_SERVICE_URL,
  redisUrl: process.env.API_GATEWAY_REDIS_URL,
  jwtSecret: process.env.API_GATEWAY_JWT_SECRET,
};

module.exports = config;
