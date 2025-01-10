const logger = require("../utils/logger");
const jwt = require('jsonwebtoken');


const validateToken = (req, res, next) => {
  // get the token from the header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Access attempted without valid token');
    return res.status(401).json({ success: false, message: 'Access denied, authentication required' });
  }

  // verify the token

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.error(`Invalid token!: ${err.message}`);
      return res.status(429).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}


module.exports = { validateToken };
