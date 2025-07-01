import {
  loginService,
  refreshTokenService,
  logoutService,
  sendOtpService,
  verifyOtpService
} from '../services/authService.js';




export const sendOtp = async (req, res) => {
  try {
    // Now expects name, email, password
    const { name, email, password } = req.body;
    const result = await sendOtpService({ name, email, password });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Send OTP error:", error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};


// verify otp controller
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyOtpService(email, otp);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("OTP verification error:", error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};


export const login = async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const result = await loginService(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(401).json({ success: false, error: error.message });
  }
};

export const refreshToken = async (req, res) => {
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

export const logout = async (req, res) => {
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
