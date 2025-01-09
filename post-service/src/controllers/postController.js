const logger = require('../config/utils/logger');

const Post = require('../models/Post');

const createPost = async (req, res) => {
  try {
    //  1. Get the title, content, and mediaUrls from the request body
    const { title, content, mediaIds } = req.body;

    const newPost = new Post({
      user: req.user.userId,
      title,
      content,
      mediaIds: mediaIds || []
    });

    await newPost.save();
    logger.info('Post created successfully', { post: newPost });

    res.status(201).json({ success: true, message: 'Post created successfully', data: newPost });


  } catch (error) {
    logger.error('Error creating post', { error: error.message });
    res.status(500).send({ success: false, message: 'Error creating post' });
  }
};

const getPosts = async (req, res) => {
  try {

  } catch (error) {
    logger.error('Error fetching posts', { error: error.message });
    res.status(500).send({ success: false, message: 'Error fetching posts' });
  }
};

const getAllPost = async (req, res) => {
  try {

  } catch (error) {
    logger.error('Error fetching post', { error: error.message });
    res.status(500).send({ success: false, message: 'Error fetching post by ID' });
  }
};

const deletePost = async (req, res) => {
  try {

  } catch (error) {
    logger.error('Error deleting post', { error: error.message });
    res.status(500).send({ success: false, message: 'Error deleting post by ID' });
  }
};


module.exports = { createPost, getPosts, getAllPost, deletePost };
