
const logger = require('../utils/logger');
const Media = require('../models/Media');
const uploadMediaToCloudinary = require('../utils/cloudinary');

const uploadMedia = async (req, res) => {
  logger.info(' Start uploading media to Cloudinary');
  try {
    // Check if the request contains a file
    const file = req.file;
    console.log(file, "req-file");
    if (!file) {
      logger.error('No file found in request. Please add a file and try again');
      return res.status(400).json({ error: 'No file found in request. Please add a file and try again' });
    }

    // Upload the file to Cloudinary
    const { originalname, mimetype, buffer } = req.file;

    // Get the user ID from the request
    const userId = req.user.userId;
    logger.info(`Start uploading file: name= ${originalname}, type =${mimetype} to Cloudinary`);
    const uploadResult = await uploadMediaToCloudinary(file);
    logger.info(`File uploaded to Cloudinary successfully: ${uploadResult.public_id}`);

    const newMedia = new Media({
      publicId: uploadResult.public_id,
      originalName: originalname,
      mimeType: mimetype,
      url: uploadResult.secure_url,
      userId,
    });

    // Save the media to the database
    await newMedia.save();
    logger.info('Media saved to the database successfully');

    return res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      media: newMedia,
      url: uploadResult.url,
    });
  } catch (error) {
    logger.error(`Error uploading media to Cloudinary: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
 };

module.exports = { uploadMedia };
