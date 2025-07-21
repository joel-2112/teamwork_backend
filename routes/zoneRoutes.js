import express from "express";
const router = express.Router();
import {
  createZone,
  getAllZones,
  getZoneById,
  updateZone,
  deleteZone,
  getZoneByRegionId,
} from "../controllers/zoneController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";

router.post("/create-zone", protect, requireRole("admin"), createZone);
router.get("/all-zone", getAllZones);
router.get("/zone/:id", getZoneById);
router.get("/region-zone/:id", getZoneByRegionId);
router.put("/update/:id", protect, requireRole("admin"), updateZone);
router.delete("/delete/:id", protect, requireRole("admin"), deleteZone);

export default router;
