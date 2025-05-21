// controllers/authController.js
const {
  registerService,
  loginService,
  refreshTokenService,
  logoutService,
} = require('../services/authService');

const register = async (req, res) => {
  try {
    // Log request body for debugging
    console.log('Register request body:', req.body);

    const result = await registerService(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};

const login = async (req, res) => {
  try {
    // Log request body for debugging
    console.log('Login request body:', req.body);

    const result = await loginService(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(401).json({ success: false, error: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new Error('Refresh token is required');
    const result = await refreshTokenService(refreshToken);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Refresh token error:', error.message);
    res.status(401).json({ success: false, error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new Error('Refresh token is required');
    await logoutService(refreshToken);
    res.status(204).json({ success: true });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};