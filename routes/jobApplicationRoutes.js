import express from "express";
const router = express.Router();
import {
  createJobApplication,
  getApplicationsByJobId,
  getJobApplicationById,
  updateApplicationStatus,
  deleteJobApplication,
} from "../controllers/jobApplicationController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

router.post("/apply", upload.single("document"), protect, createJobApplication);
router.get("/job-applications/:jobId", protect, requireRole('admin'), getApplicationsByJobId);
router.get("/applications/:id", protect, requireRole('admin'), getJobApplicationById);
router.put("/update-status/:id", protect, requireRole('admin'), updateApplicationStatus);
router.delete("/delete/:id", protect, requireRole('admin'), deleteJobApplication);

export default router;
