const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const { v4: uuidv4 } = require('uuid');
const RefreshToken = require('../models/RefreshToken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
// Register a new user
const register = async ({ name, email, password }) => {
  // Check if user exists
  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    const error = new Error('User already exists');
    error.status = 400;
    throw error;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const newUser = await User.create({ name, email, password: hashedPassword });

  // Generate JWT token
  const token = generateToken({ id: newUser.id, email: newUser.email });

  return {
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
    token,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const token = generateToken({ id: user.id, email: user.email });
  const refreshToken = uuidv4();
  await RefreshToken.create({ token: refreshToken, userId: user.id });

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
    refreshToken,
  };
};

const refreshAccessToken = async (refreshToken) => {
  const tokenRecord = await RefreshToken.findOne({ where: { token: refreshToken } });
  if (!tokenRecord) {
    const error = new Error('Invalid refresh token');
    error.status = 401;
    throw error;
  }

  const user = await User.findByPk(tokenRecord.userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 401;
    throw error;
  }

  const newToken = generateToken({ id: user.id, email: user.email });
  return { user: { id: user.id, name: user.name, email: user.email }, token: newToken };
};
const requestPasswordReset = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = Date.now() + 3600000; // 1 hour

  await User.update(
    { resetToken, resetTokenExpiry },
    { where: { id: user.id } }
  );

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    to: email,
    subject: 'Password Reset',
    text: `Click this link to reset your password: http://your-frontend-url.com/reset-password?token=${resetToken}`,
  });

  return { message: 'Password reset email sent' };
};

const resetPassword = async ({ token, newPassword }) => {
  const user = await User.findOne({
    where: {
      resetToken: token,
      resetTokenExpiry: { [Op.gt]: Date.now() },
    },
  });

  if (!user) {
    const error = new Error('Invalid or expired reset token');
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await User.update(
    { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    { where: { id: user.id } }
  );

  return { message: 'Password reset successful' };
};
module.exports = { register, login, refreshAccessToken, requestPasswordReset, resetPassword };