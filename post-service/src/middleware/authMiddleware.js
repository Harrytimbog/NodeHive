const logger = require('../utils/logger');

const authenticateRequest = (req, res, next) => {
  const userId = req.headers['x-user-id']; // get the user id from the request headers

  if(!userId) {
    logger.error('Access attempt without user id');
    return res.status(401).send({ success: false, message: 'User not authenticated! Please login' });
  }

  req.user = { userId };
  next();
}

module.exports = authenticateRequest;
