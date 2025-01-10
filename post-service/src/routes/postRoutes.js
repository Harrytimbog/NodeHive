const router = require('express').Router();
const { createPost, getPost, getAllPosts, editPost, deletePost } = require('../controllers/postController');
const authenticateRequest = require('../middleware/authMiddleware');

// middleware -> this will tell if the user is authenticated or not


// router.use(authenticateRequest);
router.post('/create-post', authenticateRequest, createPost);
router.get('/all-posts', authenticateRequest, getAllPosts);
router.get('/:id', authenticateRequest, getPost);
router.put('/:id', authenticateRequest, editPost);
router.delete('/:id', authenticateRequest, deletePost);


module.exports = router;
