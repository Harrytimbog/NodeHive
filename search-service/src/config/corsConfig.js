const cors = require('cors');

const configureCors = () => {
  return cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',  // Local development
        'https://yourcustomdomain.com',  // Production domain
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);  // Allow access
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],  // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Version'],  // Allowed headers
    exposedHeaders: ['X-Total-Count', 'Content-Range'],  // Headers accessible to the client
    credentials: true,  // Support for cookies and credentials
    preflightContinue: false,  // Do not continue to the next middleware on preflight
    maxAge: 600,  // Cache preflight requests for 10 minutes
    optionsSuccessStatus: 204,  // Return 204 status code for successful preflight requests
  });

};


module.exports = {configureCors};
