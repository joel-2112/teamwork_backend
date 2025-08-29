// routes/serviceRoutes.js
import express from "express";
const router = express.Router();
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

router.post(
  "/create-service",
  upload.fields([
    { name: "imageUrl", maxCount: 5 },
    { name: "videoUrl", maxCount: 3 },
    { name: "fileUrl", maxCount: 1 },
  ]),
  protect,
  requireRole("admin"),
  createService
);
router.put(
  "/update/:id",
  upload.fields([
    { name: "imageUrl", maxCount: 5 },
    { name: "videoUrl", maxCount: 3 },
    { name: "fileUrl", maxCount: 1 },
  ]),
  protect,
  requireRole("admin"),
  updateService
);
router.delete("/delete/:id", protect, requireRole("admin"), deleteService);
router.get("/all-services", getAllServices);
router.get("/service/:id", getServiceById);

export default router;
