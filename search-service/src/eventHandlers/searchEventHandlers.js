const SearchPost = require("../models/Search");
const logger = require("../utils/logger");

async function handlePostCreated(event) {
  try {
    // Extract required fields from the event
    const { postId, userId, title, content, createdAt } = event;

    // Ensure all required fields are present
    if (!postId || !userId || !title || !content || !createdAt) {
      throw new Error('Missing required fields in post.created event');
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
    logger.info("Search post created successfully", { postId: newSearchPost._id.toString() });
  } catch (error) {
    logger.error("Error handling post created event", error);
  }
}

async function handlePostDeleted(event) {
  try {
    logger.info("Handling post deleted event", event);
    // Extract postId from the event
    const { postId } = event;

    // Ensure postId is present
    if (!postId) {
      throw new Error('Missing postId in post.deleted event');
    }

    // Find and delete the corresponding SearchPost document
    const searchPost = await SearchPost.findOneAndDelete({ postId });
    if (searchPost) {
      logger.info("Search post deleted successfully", { postId });
    } else {
      logger.warn("Search post not found for deletion", { postId });
    }
  } catch (error) {
    logger.error("Error handling post deleted event", error);
  }
}

module.exports = {
  handlePostCreated,
  handlePostDeleted,
};
