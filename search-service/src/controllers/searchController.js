const SearchPost = require('../models/Search');
const logger = require('../utils/logger');


const searchPosts = async (req, res) => {
  logger.info('Search endpoint hit');
  try {
    // Extract query from request
    const { query } = req.query;

    // Check if aearch post are cached
    const cachedKey = `search:${query}`;
    const cachedPosts = await req.redisClient.get(cachedKey);
    if (cachedPosts) {
      logger.info('Returning cached search results');
      return res.status(200).json({ success: true, message: "Search fetched from cache",  posts: JSON.parse(cachedPosts) });
    }

    // If not cached, search from the database
    // Search for posts that match the query
    const posts = await SearchPost.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } }
    ).limit(10);

    // Cache the search results
    await req.redisClient.setex(cachedKey, 3600, JSON.stringify(posts));
    // Return the posts
    res.status(200).json({ success: true, posts });
  } catch (error) {
    logger.error('Error while searching Post', error);
    res.status(500).json({ success: false, message: 'Error while searching Post' });
  }
}

module.exports = { searchPosts };
