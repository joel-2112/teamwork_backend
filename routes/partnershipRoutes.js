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
} from "../controllers/partnershipController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js"

router.post("/apply-partnership", protect, createPartnership);
router.get("/all-partnerships",  getAllPartnerships);
router.get("/partnership/:id", getPartnershipById);
router.put("/update/:id", updatePartnership);
router.delete("/delete/:id", deletePartnership);
router.put("/update-status/:id", updatePartnershipStatus);

export default router;
