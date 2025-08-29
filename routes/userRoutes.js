// routes/userRoutes.js
import express from "express";
const router = express.Router();
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createAdminUser,
  updateUserStatus,
  userStatistics,
  changePassword,
  forgotPassword,
  verifyPasswordResetOtp,
  resetPassword,
  updateProfile,
} from "../controllers/userController.js";
import {
  createUserValidator,
  loginValidator,
} from "../middlewares/validators/authValidator.js";
import { validateRequest } from "../middlewares/validators/validateRequest.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js"

router.post(
  "/create-admin",
  protect,
  requireRole("admin"),
  createAdminUser
);
router.put(
  "/update-status/:id",
  protect,
  requireRole("admin"),
  updateUserStatus
);
router.put(
  "/update-profile",
  protect,
  upload.single("profilePicture"),
  updateProfile
);
router.get("/all-users", protect, requireRole("admin"), getAllUsers);
router.get("/user/:id", protect, requireRole("admin"), getUserById);
router.put("/update/:id", protect, requireRole("admin"), updateUser);
router.delete("/delete/:id", protect, requireRole("admin"), deleteUser);
router.get("/user-stat", protect, requireRole("admin"), userStatistics);
router.put("/change-password", protect, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-reset-otp", verifyPasswordResetOtp);

export default router;
