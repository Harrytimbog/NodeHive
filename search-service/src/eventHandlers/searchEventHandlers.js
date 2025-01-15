const SearchPost = require("../models/Search");
const logger = require("../utils/logger");

async function handlePostCreated(event) {
  console.log({ "Handling post created event": event });
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

module.exports = {
  handlePostCreated
};
