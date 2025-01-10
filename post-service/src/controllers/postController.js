const logger = require('../utils/logger');

const Post = require('../models/Post');
const { validateCreatePost } = require('../utils/validation');


// Create a post
const createPost = async (req, res) => {
  logger.info('Creating post end point hit by', { user: req.user.userId });
  try {
    //  1. Get the title, content, and mediaUrls from the request body
    const { error } = validateCreatePost(req.body);
    if (error) {
      logger.warn('Validation error creating post', { error: error.details[0].message });
      return res.status(400).send({ success: false, message: error.details[0].message });
     }
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

// Fetch all posts

const getAllPosts = async (req, res) => {
  logger.info('Fetching all posts');
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cacheKey = `posts:${page}:${limit}`;
    const cachedPosts = await req.redisClient.get(cacheKey);

    //  1. Check if the posts are cached

    if (cachedPosts) {
      logger.info('Posts fetched from cache');
      //  2. If cached, return the cached posts
      return res.status(200).json({ success: true, message: 'Posts fetched successfully', data: JSON.parse(cachedPosts) });
    }

    //  3. If not cached, fetch the posts from the database
    logger.info(`Querying database for page ${page}, limit ${limit}`);

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      // .populate('user', 'username, email');

    const totalNoPosts = await Post.countDocuments();
    logger.info(`Number of posts found in database: ${totalNoPosts}`);

    const result = {
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalNoPosts / limit),
      totalPosts: totalNoPosts
    };

    // Cache the result for future requests
    await req.redisClient.set(cacheKey, JSON.stringify(result), 'EX', 300); // cache for 5 minutes

    logger.info('Posts fetched from database and cached');
    res.json({ success: true, message: 'Posts fetched successfully', data: result });

  } catch (error) {
    logger.error('Error fetching post', { error: error.message });
    res.status(500).send({ success: false, message: 'Error fetching posts' });
  }
};

// Fetch a post by ID
const getPosts = async (req, res) => {
  try {

  } catch (error) {
    logger.error('Error fetching posts', { error: error.message });
    res.status(500).send({ success: false, message: 'Error fetching posts' });
  }
};

// Fetch a post by ID
const deletePost = async (req, res) => {
  try {

  } catch (error) {
    logger.error('Error deleting post', { error: error.message });
    res.status(500).send({ success: false, message: 'Error deleting post by ID' });
  }
};


module.exports = { createPost, getAllPosts, getPosts, deletePost };
