const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');

const generateToken = async (user) => {
  const accessToken = await jwt.sign({
    userId: user._id,
    username: user.username,
  }, process.env.JWT_SECRET, { expiresIn: '15m' });

  const refreshToken = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now());
  expiresAt.setDate(expiresAt.getDate() + 7); // refresh token expires in 7 days


  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt,
  })

  return { accessToken, refreshToken };

};

module.exports = generateToken;
