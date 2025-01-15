const express = require('express');
const { searchPosts } = require('../controllers/searchController');
const { authenticateRequest } = require('../middleware/authMiddleware');

// Create a new router
const router = express.Router();

router.use(authenticateRequest);

router.get('/posts', searchPosts);


module.exports = router;
