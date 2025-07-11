import express from "express";
const router = express.Router();
import {
  createWoreda,
  getAllWoredas,
  getWoredaById,
  updateWoreda,
  deleteWoreda,
  getWoredByZoneId,
} from "../controllers/woredaController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";

router.post("/create-woreda", protect, requireRole('admin'), createWoreda);
router.get("/all-woreda", getAllWoredas);
router.get("/woreda/:id", getWoredaById);
router.get("/zone-woreda", getWoredByZoneId)
router.put("/update/:id", protect, requireRole('admin'), updateWoreda);
router.delete("/delete/:id", protect, requireRole('admin'), deleteWoreda);

export default router;
