const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { RefreshToken } = require('../models/refreshToken');
const { envConfig } = require('../config');

const { jwtSecret } = envConfig;

const generateToken = async (user) => {
  const accessToken = await jwt.sign({
    userId: user._id,
    username: user.username,
  }, jwtSecret, { expiresIn: '15m' });

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
