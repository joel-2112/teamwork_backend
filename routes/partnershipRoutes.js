// routes/partnershipRoutes.js
import express from "express";
const router = express.Router();
import {
  createPartnership,
  getAllPartnerships,
  getPartnershipById,
  updatePartnership,
  deletePartnership,
  updatePartnershipStatus,
  getMyPartnerships,
} from "../controllers/partnershipController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js"

router.post("/apply-partnership", protect, createPartnership);
router.get("/all-partnerships", protect, getAllPartnerships);
router.get("/partnership/:id", protect, getPartnershipById);
router.put("/update/:id", protect, updatePartnership);
router.delete("/delete/:id", protect, deletePartnership);
router.put("/update-status/:id", protect, updatePartnershipStatus);
router.get("/my-partnerships", protect, getMyPartnerships);

export default router;
