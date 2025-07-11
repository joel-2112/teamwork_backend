import express from "express";
const router = express.Router();
import {
  createRegion,
  getAllRegions,
  getRegionById,
  updateRegion,
  deleteRegion,
} from "../controllers/regionController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";

router.post("/create-region", protect, requireRole("admin"), createRegion);
router.put("/update/:id", protect, requireRole("admin"), updateRegion);
router.delete("/delete/:id", protect, requireRole("admin"), deleteRegion);
router.get("/all-region", getAllRegions);
router.get("/region/:id", getRegionById);

export default router;
