const config = {
  port: process.env.MEDIA_SERVICE_PORT || 3003,
  mongodbUri: process.env.MEDIA_SERVICE_MONGODB_URI,
  cloudinaryDetails: {
    cloudName: process.env.MEDIA_SERVICE_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.MEDIA_SERVICE_CLOUDINARY_API_KEY,
    apiSecret: process.env.MEDIA_SERVICE_CLOUDINARY_API_SECRET,
  },
  jwtSecret: process.env.MEDIA_SERVICE_JWT_SECRET,
  nodeEnv: process.env.MEDIA_SERVICE_NODE_ENV || 'development',
  redisUrl: process.env.MEDIA_SERVICE_REDIS_URL,
  rabbitmqUrl: process.env.MEDIA_SERVICE_RABBITMQ_URL,
};

module.exports = config;
