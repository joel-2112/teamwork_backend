import express from "express";
const router = express.Router();
import {
  createJobApplication,
  getApplicationsByJobId,
  getJobApplicationById,
  updateApplicationStatus,
  deleteJobApplication,
} from "../controllers/jobApplicationController.js";
import upload from "../middlewares/upload.js";

router.post("/apply", upload.single("document"), createJobApplication);
router.get("/job-applications/:jobId", getApplicationsByJobId);
router.get("/applications/:id", getJobApplicationById);
router.put("/update-status/:id", updateApplicationStatus);
router.delete("/delete/:id", deleteJobApplication);

export default router;
