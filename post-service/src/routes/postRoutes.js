const router = require('express').Router();
const { createPost, getPosts, getAllPost, deletePost } = require('../controllers/postController');
const authenticateRequest = require('../middleware/authMiddleware');

// middleware -> this will tell if the user is authenticated or not


// router.use(authenticateRequest);
router.post('/create-post', authenticateRequest, createPost);

module.exports = router;
