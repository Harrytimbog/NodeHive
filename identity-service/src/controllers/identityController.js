const logger = require('../utils/logger');
const { validateRegisteration } = require('../utils/validation');
const { User } = require('../models/User')
const generateToken = require('../utils/generateToken');
// user registration

const registerUser = async (req, res) => {
  logger.info('Registering endpoint hit...');
  try {
    // validate request
    const { error } = validateRegisteration(req.body);

    if (error) {
      logger.warn('Validation error: ', error.details[0].message);
      return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const { username, email, firstName, lastName, password } = req.body;

    // check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      // log error
      logger.warn('User already exists');
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    user = new User({ username, email, firstName, lastName, password });
    await user.save();
    logger.warn('User saved successfully', user._id);

    const { accessToken, refreshToken } = await generateToken(user);

    res.status(201).json({ success: true, message: 'User registered Successfully', accessToken, refreshToken });

  } catch (error) {
    logger.error('Error registering user: ', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// user-login

/// refresh token

// logout


module.exports= { registerUser }
