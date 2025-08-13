import express from "express";
import { protect, requireRole } from "../middlewares/authMiddleware.js";
import {
  createReport,
  getAllReports,
  getReportsById,
  updateReport,
  getMyReports,
  cancelReport,
  updateReportStatus,
  deleteReport,
  getDeletedReports,
  reportStatistics,
} from "../controllers/reportController.js";
import cloudinaryUpload from "../middlewares/cloudinaryUpload.js";
const router = express.Router();

router.post(
  "/create-report",
  cloudinaryUpload.fields([
    { name: "imageUrl", maxCount: 5 },
    { name: "videoUrl", maxCount: 3 },
    { name: "fileUrl", maxCount: 1 },
  ]),
  protect,
  requireRole("admin", "regionAdmin", "zoneAdmin", "woredaAdmin", "agent"),
  createReport
);
router.put(
  "/update/:id",
  protect,
  cloudinaryUpload.fields([
    { name: "imageUrl", maxCount: 5 },
    { name: "videoUrl", maxCount: 3 },
    { name: "fileUrl", maxCount: 1 },
  ]),
  updateReport
);
router.get(
  "/all-reports",
  protect,
  requireRole("admin", "regionAdmin", "zoneAdmin", "woredaAdmin"),
  getAllReports
);
router.get(
  "/report/:id",
  protect,
  requireRole("admin", "regionAdmin", "zoneAdmin", "woredaAdmin"),
  getReportsById
);
router.put(
  "/update-status/:id",
  protect,
  requireRole("admin", "regionAdmin", "zoneAdmin", "woredaAdmin"),
  updateReportStatus
);
router.delete("/delete/:id", protect, requireRole("admin"), deleteReport);
router.get(
  "/deleted-reports",
  protect,
  requireRole("admin", "regionAdmin", "zoneAdmin", "woredaAdmin", "agent"),
  getDeletedReports
);
router.get(
  "/report-stat",
  protect,
  requireRole("admin", "regionAdmin", "zoneAdmin", "woredaAdmin"),
  reportStatistics
);
router.get("/my-reports", protect, getMyReports);
router.put("/cancel/:id", protect, cancelReport);

export default router;
