const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

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

// Login a user
const login = async ({ email, password }) => {
  // Check if user exists
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  // Generate JWT token
  const token = generateToken({ id: user.id, email: user.email });

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
  };
};

module.exports = { register, login };