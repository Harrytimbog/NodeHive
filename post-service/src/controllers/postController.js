const logger = require('../utils/logger');

const Post = require('../models/Post');
const { validateCreatePost } = require('../utils/validation');
const { publishEvent } = require('../utils/rabbitmq');

// Invalidate the cache for posts
async function inValidatePostCache(req, input) {
  // Delete the cached post
  const cachedKey = `post:${input}`;
  await req.redisClient.del(cachedKey);
  // 1. Get all keys related to post from the cache
  const keys = await req.redisClient.keys('posts:*');
  if (keys.length > 0) {
    logger.info('Invalidating post cache');
    // 2. Delete all the keys
    await req.redisClient.del(keys);
  }
}

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
    // Invalidate the cache for previously cached posts
    await inValidatePostCache(req, newPost._id.toString());
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
const getPost = async (req, res) => {
  try {
    // 1. Get the post ID from the request params
    const postId = req.params.id;
    // 2. Check if the post is cached

    const cachekey = `post:${postId}`;
    const cachedPost = await req.redisClient.get(cachekey);

    if (cachedPost) {
      logger.info('Post fetched from cache');
      return res.status(200).json({ success: true, message: 'Post fetched successfully', data: JSON.parse(cachedPost) });
    }

    // 3. If not cached, fetch the post from the database
    const post = await Post.findById(postId);
    if (!post) {
      logger.warn('Post not found');
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // cache for 1 hour because posts are not updated frequently
    logger.info('Post fetched from database and cached');
    await req.redisClient.set(cachekey, JSON.stringify(post), 'EX', 3600);
    res.status(200).json({ success: true, message: 'Post fetched successfully', data: post });

  } catch (error) {
    logger.error('Error fetching posts', { error: error.message });
    res.status(500).send({ success: false, message: 'Error fetching post' });
  }
};

// Edit a post by ID

const editPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findOneAndUpdate({
      _id: postId,
      user: req.user.userId
    }, req.body, { new: true });

    if (!post) {
      logger.warn('Post not found');
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Invalidate the cache for previously cached posts
    await inValidatePostCache(req, req.params.id);
    logger.info('Post edited successfully', { post });
    res.status(200).json({ success: true, message: 'Post edited successfully', data: post });
  } catch (error) {
    logger.error('Error editing posts', { error: error.message });
    res.status(500).send({ success: false, message: 'Error editing post' });
  }
}

// Delete a post by ID
const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findOneAndDelete({
      _id: postId,
      user: req.user.userId
    })

    if (!post) {
      logger.warn('Post not found');
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Publish Delete Post Event
    await publishEvent('post.deleted', {
      postId: post._id,
      userId: req.user.userId,
      mediaIds: post.mediaIds
    });
    // Invalidate the cache for previously cached posts
    await inValidatePostCache(req, req.params.id);
    logger.info('Post deleted successfully');
    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    logger.error('Error deleting post', { error: error.message });
    res.status(500).send({ success: false, message: 'Error deleting post by ID' });
  }
};


module.exports = { createPost, getAllPosts, getPost, editPost, deletePost };
