const router = require('express').Router();
const { createPost, getPosts, getAllPost, deletePost } = require('../controllers/postController');

// middleware -> this will tell if the user is authenticated or not

