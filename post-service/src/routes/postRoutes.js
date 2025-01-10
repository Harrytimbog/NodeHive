const router = require('express').Router();
const { createPost, getPost, getAllPosts, deletePost } = require('../controllers/postController');
const authenticateRequest = require('../middleware/authMiddleware');

// middleware -> this will tell if the user is authenticated or not


// router.use(authenticateRequest);
router.post('/create-post', authenticateRequest, createPost);
router.get('/all-posts', authenticateRequest, getAllPosts);
router.get('/:id', authenticateRequest, getPost);


module.exports = router;
