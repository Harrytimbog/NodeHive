const cloudinary = require("cloudinary").v2;
const logger = require("./logger");
const { envConfig } = require("../config");


const { cloudinaryDetails } = envConfig;

cloudinary.config({
  cloud_name: cloudinaryDetails.cloudName,
  api_key: cloudinaryDetails.apiKey,
  api_secret: cloudinaryDetails.apiSecret,
});

const uploadMediaToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          logger.error("Error while uploading media to cloudinary", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(file.buffer);
  });
};

const deleteMediaFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info("Media deleted from cloudinary successfully", publicId);
    return result;
  } catch (error) {
    logger.error("Error while deleting media from cloudinary", error);
    throw error;
  }
}

module.exports = { uploadMediaToCloudinary, deleteMediaFromCloudinary };
