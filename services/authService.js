// services/authService.js
const jwt = require('jsonwebtoken');
const { User, RefreshToken } = require('../models');
const { generateToken } = require('../utils/generateToken'); // Adjust path

const registerService = async ({ name, email, password }) => {
  // Validate required fields
  if (!email) throw new Error('Missing required field: email');
  if (!password) throw new Error('Missing required field: password');

  // Check for existing user
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw new Error('Email already exists');

  // Create user (name is optional)
  const user = await User.create({ name, email, password });

  // Generate tokens
  const accessToken = generateToken({ userId: user.id });
  const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  // Store refresh token
  await RefreshToken.create({ token: refreshToken, userId: user.id });

  return { user: { id: user.id, name: user.name, email: user.email }, accessToken, refreshToken };
};

const loginService = async ({ email, password }) => {
  if (!email) throw new Error('Missing required field: email');
  if (!password) throw new Error('Missing required field: password');

  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Invalid email or password');

  const isValid = await user.validatePassword(password);
  if (!isValid) throw new Error('Invalid email or password');

  const accessToken = generateToken({ userId: user.id });
  const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  await RefreshToken.create({ token: refreshToken, userId: user.id });

  return { user: { id: user.id, name: user.name, email: user.email }, accessToken, refreshToken };
};

const refreshTokenService = async (refreshToken) => {
  if (!refreshToken) throw new Error('Refresh token is required');

  const token = await RefreshToken.findOne({ where: { token: refreshToken } });
  if (!token) throw new Error('Invalid refresh token');

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateToken({ userId: payload.userId });
    return { accessToken };
  } catch (err) {
    throw new Error('Invalid refresh token');
  }
};

const logoutService = async (refreshToken) => {
  if (!refreshToken) throw new Error('Refresh token is required');
  await RefreshToken.destroy({ where: { token: refreshToken } });
};

module.exports = {
  registerService,
  loginService,
  refreshTokenService,
  logoutService,
};