const cloudinary = require('cloudinary').v2;
const logger = require('./logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadMediaToCloudinary = async (file) => {
  // Return a new promise
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
      if (error) {
        logger.error(`Error uploading file to Cloudinary: ${error.message}`);
        reject(error);
      } else {
        resolve(result);
      }
    })
    // End the stream by sending the buffer
    uploadStream.end(file.buffer);
  });
}

module.exports = {
  uploadMediaToCloudinary,
};
