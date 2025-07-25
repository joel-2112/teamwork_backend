// routes/userRoutes.js
import express from "express";
const router = express.Router();
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createAdminUser,
  blockUserById
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
router.put("/block/:id", protect, requireRole('admin'), blockUserById)
router.delete("/delete/:id", protect, requireRole('admin'), deleteUser);

export default router;
