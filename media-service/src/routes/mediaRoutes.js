const logger = require('../utils/logger');
const express = require('express');
const multer = require('multer');
const { uploadMedia } = require('../controllers/mediaController');

const authenticateUser = require('../middleware/authMiddleware');

const router = express.Router();

// Set up multer to handle file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb
  },
}).single('file');

router.post('/upload', authenticateUser, (req, res, next) => {
  upload(req, res, async (err) => {
    // If an error occurs
    if (err instanceof multer.MulterError) {
      logger.error(`Error uploading file: ${err.message}`);
      return res.status(400).json({
        message: 'Multer error while uploading file',
        error: err.message,
        stack: err.stack
      });
    } else if (err) {
      // An unknown error occurred when uploading.
      logger.error(`Error uploading file: ${err.message}`);
      return res.status(500).json({
        message: 'Error uploading file',
        error: err.message,
        stack: err.stack
      });
    }
    // If no file is uploaded
    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded',
      });
    }
    next();
  });
}, uploadMedia);

module.exports = router;
