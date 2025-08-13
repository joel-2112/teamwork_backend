// routes/authRoutes.js
import express from "express";
const router = express.Router();
import {
  sendOtp,
  verifyOtp,
  login,
  refreshToken,
  logout,
  checkAuth,
} from "../controllers/authController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";


router.post("/send-otp",  sendOtp);
router.post("/login",  login);
router.post("/verify-otp", verifyOtp);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.get("/check-auth", protect, checkAuth);

export default router;
