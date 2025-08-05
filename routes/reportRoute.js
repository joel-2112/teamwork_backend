import express from "express";
import upload from "../middlewares/upload.js";
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
} from "../controllers/reportController.js";

const router = express.Router();

router.post(
  "/create-report",
  protect,
  upload.fields([
    { name: "imageUrl", maxCount: 5 },
    { name: "videoUrl", maxCount: 3 },
    { name: "fileUrl", maxCount: 1 },
  ]),
  createReport
);
router.put(
  "/update/:id",
  protect,
  upload.fields([
    { name: "imageUrl", maxCount: 1 },
    { name: "videoUrl", maxCount: 1 },
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
router.get("/report/:id", protect, requireRole("admin"), getReportsById);
router.put(
  "/update-status/:id",
  protect,
  requireRole(["admin", "regionAdmin", "zoneAdmin", "woredaAdmin"]),
  updateReportStatus
);
router.delete("/delete/:id", protect, requireRole("admin"), deleteReport);
router.get(
  "/deleted-reports",
  protect,
  requireRole("admin"),
  getDeletedReports
);
router.get("/my-reports", protect, getMyReports);
router.put("/cancel/:id", protect, cancelReport);

export default router;
