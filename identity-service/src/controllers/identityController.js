const logger = require('../utils/logger');
const { validateRegisteration, validateLogin } = require('../utils/validation');
const { User } = require('../models/User')
const generateToken = require('../utils/generateToken');
const{ RefreshToken } = require('../models/refreshToken');
// user registration

const registerUser = async (req, res) => {
  logger.info('Registering endpoint hit...');
  try {
    // validate request
    const { error } = validateRegisteration(req.body);

    if (error) {
      logger.warn('Validation error: ', error.details[0].message);
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { username, email, firstName, lastName, password } = req.body;

    // check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      // log error
      logger.warn('User already exists');
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    user = new User({ username, email, firstName, lastName, password });
    await user.save();
    logger.warn('User saved successfully', user._id);

    const { accessToken, refreshToken } = await generateToken(user);

    res.status(201).json({ success: true, message: 'User registered Successfully', accessToken, refreshToken });

  } catch (error) {
    logger.error('Error registering user: ', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// user-login
const loginUser = async (req, res) => {
  logger.info('Login endpoint hit...');

  try {
    const { error } = validateLogin(req.body);

    if (error) {
      logger.warn('Validation error: ', error.details[0].message);
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      logger.warn('User not found');
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Validate password

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn('Invalid password');
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    // Generate token
    const { accessToken, refreshToken } = await generateToken(user);

    res.json({ success: true, message: 'Login successful', accessToken, refreshToken, userId: user._id });

  } catch (error) {
    logger.error('Error logging in user: ', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/// refresh token

const refreshUserToken = async (req, res) => {
  logger.info('Refresh token endpoint hit...');
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn('Refresh token not provided');
      return res.status(400).json({ success: false, message: 'Refresh token not provided' });
    }

    // check if refresh token exists in the database RefreshToken table
    const storedToken = await RefreshToken.findOne({token: refreshToken});

    if (!storedToken || storedToken.expireAt < new Date()) {
      logger.warn('Invalid or expired refresh token');
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById( storedToken.user );

    if (!user) {
      logger.warn('User not found');
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateToken(user);

    // delete the old refresh token
    await RefreshToken.deleteOne({ _id: storedToken._id });

    // return the new tokens

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

    res.json({ success: true, message: 'Token refreshed successfully', accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    logger.error('Error refreshing token: ', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// logout

const logoutUser = async (req, res) => {
  logger.info('Logout endpoint hit...');
  try {
    // validate request
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn('Refresh token not provided');
      return res.status(400).json({ success: false, message: 'Refresh token not provided' });
    }

    await RefreshToken.deleteOne({ token: refreshToken });
    logger.info('User logged out successfully | Refresh token deleted');

    return res.json({ success: true, message: 'User logged out successfully' });

    // check if refresh token exists in the database RefreshToken table
    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken) {
      logger.warn('Invalid refresh token');
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    // delete the old refresh token
    await RefreshToken.deleteOne({ _id: storedToken._id });

    res.json({ success: true, message: 'User logged out successfully' });
  } catch (error) {
    logger.error('Error while logging out user: ', error);
    res.status(500).json({ success: false, message: 'Internal server error' });

  }
}


module.exports= { registerUser, loginUser, refreshUserToken, logoutUser }
