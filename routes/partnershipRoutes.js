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
  cancelMyPartnershipRequest
} from "../controllers/partnershipController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js"

router.post("/apply-partnership", protect, createPartnership);
router.get("/all-partnerships", protect, requireRole('admin'), getAllPartnerships);
router.get("/partnership/:id", protect, requireRole('admin'), getPartnershipById);
router.put("/update-status/:id", protect, requireRole('admin'), updatePartnershipStatus);
router.put("/update/:id", protect, updatePartnership);
router.delete("/delete/:id", protect, deletePartnership);
router.put("/cancel/:id", protect, cancelMyPartnershipRequest)
router.get("/my-partnerships", protect, getMyPartnerships);

export default router;
