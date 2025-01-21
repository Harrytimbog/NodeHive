const Media = require("../models/Media");
const { deleteMediaFromCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const handlePostDeleted = async (event) => {
  logger.info('Received event:', { event });

  const { postId, mediaIds } = event;

  // Ensure event has the required fields
  if (!postId || !mediaIds || !Array.isArray(mediaIds)) {
    logger.warn('Invalid or no post.deleted event received:', { event });
    return;
  }

  try {
    // Delete media associated with the post
    const mediaToDelete = await Media.find({ _id: { $in: mediaIds } });

    // Delete media from Cloudinary
    for (const media of mediaToDelete) {
      await deleteMediaFromCloudinary(media.publicId);
      await Media.findByIdAndDelete(media._id);
      logger.info(
        `Deleted media ${media._id} associated with deleted post ${postId}`
      );
    }

    logger.info(`Processed deletion of media for post id: ${postId}`);
  } catch (error) {
    logger.error(
      'Error handling media deletion with post.deleted event',
      error
    );
  }
};

module.exports = { handlePostDeleted };
