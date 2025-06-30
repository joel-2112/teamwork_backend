// routes/authRoutes.js
import express from 'express';
const router = express.Router();
import {
  sendOtp,
  verifyOtp,
  login,
  refreshToken,
  logout,
} from '../controllers/authController.js';

// router.post('/register', register);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

export default router;