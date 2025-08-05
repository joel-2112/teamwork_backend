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
  resetPassword
} from "../controllers/userController.js";
import {
  createUserValidator,
  loginValidator,
} from "../middlewares/validators/authValidator.js";
import { validateRequest } from "../middlewares/validators/validateRequest.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";

// router.post('/register', register);
router.post(
  "/create-admin",
  protect,
  requireRole("admin"),
  createUserValidator,
  validateRequest,
  createAdminUser
);
router.get("/all-users", protect, requireRole('admin'), getAllUsers);
router.get("/user/:id", protect, requireRole('admin'), getUserById);
router.put("/update/:id", protect, requireRole('admin'), updateUser);
router.put("/update-status/:id", protect, requireRole('admin'), updateUserStatus)
router.delete("/delete/:id", protect, requireRole('admin'), deleteUser);
router.get("/user-stat", protect, requireRole('admin'), userStatistics);
router.put("/change-password", protect, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
