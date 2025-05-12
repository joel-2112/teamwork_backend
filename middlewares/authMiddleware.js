const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      const error = new Error('Not authorized, no token');
      error.status = 401;
      throw error;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request object
    req.user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email'], 
    });

    if (!req.user) {
      const error = new Error('Not authorized, user not found');
      error.status = 401;
      throw error;
    }

    next();
  } catch (error) {
    next(error); 
  }
};

