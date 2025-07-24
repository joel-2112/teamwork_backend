import express from "express";
import upload from "../middlewares/upload.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";
import { createReport } from "../controllers/reportController.js";

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

export default router;
