import express from "express";
const router = express.Router();
import {
  createJob,
  getOpenJobs,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  closeOpenJob,
  getAllClosedJob,
  jobStatistics,
} from "../controllers/jobController.js";
import { validateParamId } from "../middlewares/validators/authValidator.js";
import { validateRequest } from "../middlewares/validators/validateRequest.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";

//the jobController is imported from the controllers folder
router.post("/create-job", protect, requireRole("admin"), createJob);
router.put(
  "/update/:id",
  protect,
  requireRole("admin"),
  validateParamId,
  validateRequest,
  updateJob
);
router.put(
  "/close/:id",
  protect,
  requireRole("admin"),
  validateParamId,
  validateRequest,
  closeOpenJob
);
router.delete(
  "/delete/:id",
  protect,
  requireRole("admin"),
  validateParamId,
  validateRequest,
  deleteJob
);
router.get("/job/:id", validateParamId, validateRequest, getJobById);
router.get("/open-job", getOpenJobs);
router.get("/closed-job", getAllClosedJob);
router.get("/all-job", getAllJobs);
router.get(
  "/job-stat",
  protect,
  requireRole("admin", "regionAdmin", "zoneAdmin", "woredaAdmin"),
  jobStatistics
);

export default router;
