const SearchPost = require("../models/Search");
const logger = require("../utils/logger");

// Invalidate the cache for posts
async function inValidatePostCache(redisClient, input) {
  try {
    // Delete the cached post
    const cachedKey = `search:${input}`;
    await redisClient.del(cachedKey);

    // Get all keys related to search posts from the cache
    const keys = await redisClient.keys("search:*");
    if (keys.length > 0) {
      logger.info("Invalidating search post cache");
      // Delete all the keys
      await redisClient.del(keys);
    }
  } catch (error) {
    logger.error("Error invalidating search post cache", error);
  }
}

async function handlePostCreated(event, redisClient) {
  try {
    // Extract required fields from the event
    const { postId, userId, title, content, createdAt } = event;

    // Ensure all required fields are present
    if (!postId || !userId || !title || !content || !createdAt) {
      throw new Error("Missing required fields in post.created event");
    }

    // Create a new SearchPost document
    const newSearchPost = new SearchPost({
      postId,
      userId,
      title,
      content,
      createdAt,
    });

    await newSearchPost.save();

    // Invalidate the cache for previously cached search posts
    await inValidatePostCache(redisClient, newSearchPost._id.toString());
    logger.info("Search post created successfully", {
      postId: newSearchPost._id.toString(),
    });
  } catch (error) {
    logger.error("Error handling post.created event", error);
  }
}

async function handlePostDeleted(event, redisClient) {
  try {
    logger.info("Handling post.deleted event", event);

    // Extract postId from the event
    const { postId } = event;

    // Ensure postId is present
    if (!postId) {
      throw new Error("Missing postId in post.deleted event");
    }

    // Find and delete the corresponding SearchPost document
    const searchPost = await SearchPost.findOneAndDelete({ postId });
    if (searchPost) {
      logger.info("Search post deleted successfully", { postId });
      // Invalidate the cache for previously cached search posts
      await inValidatePostCache(redisClient, searchPost._id.toString());
    } else {
      logger.warn("Search post not found for deletion", { postId });
    }
  } catch (error) {
    logger.error("Error handling post.deleted event", error);
  }
}

module.exports = {
  handlePostCreated,
  handlePostDeleted,
};
