const Media = require("../models/Media");
const { deleteMediaFromCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const handlePostDeleted = async (event) => {
  console.log({ "post-delete-event": event });
  const { postId, mediaIds } = event;

  try {
    // Delete media associated with the post
    const mediaToDelete = await Media.find({ _id: { $in: mediaIds } });

    // Delete media from cloudinary
    mediaToDelete.forEach(async (media) => {
      await deleteMediaFromCloudinary(media.publicId);
      await Media.findByIdAndDelete(media._id);

      logger.info(`Deleted media ${media._id} associated with deleted post ${postId}`);
    });

    logger.info(`Processed deletion of media for post id: ${postId}`);
  } catch (error) {
    logger.error("Error handling media deletion with post deleted event", error);
  }
}

module.exports = { handlePostDeleted };
