// routes/userFeedbackRoutes.js
import express from "express";
const router = express.Router();
import {
  createUserFeedback,
  getAllUserFeedbacks,
  getUserFeedbackById,
  updateUserFeedback,
  deleteUserFeedback,
  updateUserFeedbackStatus,
  averageRating
} from "../controllers/userFeedbackController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js"

router.post("/send-feedback", createUserFeedback);
router.get("/all-feedbacks", protect, requireRole('admin'), getAllUserFeedbacks);
router.get("/feedback/:id", protect, requireRole('admin'), getUserFeedbackById);
router.put("/update/:id", protect, requireRole('admin'), updateUserFeedback);
router.delete("/delete/:id", protect, requireRole('admin'), deleteUserFeedback);
router.put("/update-status/:id", protect, requireRole('admin'), updateUserFeedbackStatus);
router.get("/average-rating", averageRating)

export default router;
