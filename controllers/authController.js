const { validationResult } = require('express-validator');
const authService = require('../services/authService');

// Register User
const registerUser = async (req, res, next) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const result = await authService.register({ name, email, password });

    return res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error); 
  }
};

// Login User
const loginUser = async (req, res, next) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    return res.status(200).json({
      message: 'Login successful',
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error); // Pass to error handler
  }
};

// Logout User (client-side token invalidation)
const logoutUser = async (req, res, next) => {
  try {
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    next(error); // Pass to error handler
  }
};

module.exports = { registerUser, loginUser, logoutUser };