import express from "express";
const router = express.Router();
import {
  createJobApplication,
  getApplicationsByJobId,
  getJobApplicationById,
  updateApplicationStatus,
  deleteJobApplication,
  getAllMyJobApplication,
  applicationStatistics,
  countApplicationsPerJob
} from "../controllers/jobApplicationController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

router.post(
  "/apply",
  upload.fields([
    { name: "document", maxCount: 1 },
    { name: "coverLetter", maxCount: 1 },
  ]),
  protect,
  createJobApplication
);
router.get("/job-applications/:jobId", protect, requireRole('admin'), getApplicationsByJobId);
router.get("/applications/:id", protect, requireRole('admin'), getJobApplicationById);
router.put("/update-status/:id", protect, requireRole('admin'), updateApplicationStatus);
router.delete("/delete/:id", protect, requireRole('admin'), deleteJobApplication);
router.get("/my-applications", protect, getAllMyJobApplication);
router.get("/application-stat", protect, requireRole('admin'), applicationStatistics)
router.get("/application-job", protect, requireRole('admin'), countApplicationsPerJob)

export default router;
