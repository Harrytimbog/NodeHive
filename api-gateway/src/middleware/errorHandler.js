const logger = require('../utils/logger');

// Custom error class

class APIError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.name = 'APIError'
  }
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

const globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack)

  if (err instanceof APIError) {
      logger.error(err.stack);
      return res.status(err.statusCode).json({
        status: 'Error',
        message: err.message
      })
    }

    // handle mongoose validation Error
    else if (err.name === 'validationError') {
      logger.error(err.stack);
      return res.status(400).json({
        status: 'error',
        message: 'validation Error'
      })
    } else {
      logger.error(err.stack);
      return res.status(500).json({
        status: 'error',
        message: 'err.message || An unexpected error occured'
      })
    }
}

module.exports = {APIError, asyncHandler, globalErrorHandler}
