const SearchPost = require('../models/Search');
const logger = require('../utils/logger');


const searchPosts = async (req, res) => {
  logger.info('Search endpoint hit');
  try {
    // Extract query from request
    const { query } = req.query;
    // Search for posts that match the query
    const posts = await SearchPost.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } }
    ).limit(10);
    // Return the posts
    res.status(200).json({ success: true, posts });
  } catch (error) {
    logger.error('Error while searching Post', error);
    res.status(500).json({ success: false, message: 'Error while searching Post' });
  }
}

module.exports = { searchPosts };
