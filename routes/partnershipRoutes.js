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
  cancelMyPartnershipRequest,
  allPartnership,
  deleteMyPartnership,
} from "../controllers/partnershipController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";
import cloudinaryUpload from "../middlewares/cloudinaryUpload.js"; 


router.get(
  "/all-partnerships",
  protect,
  requireRole("admin", "regionAdmin", "zoneAdmin", "woredaAdmin"),
  getAllPartnerships
);
router.get(
  "/partnership/:id",
  protect,
  requireRole("admin", "regionAdmin", "zoneAdmin", "woredaAdmin"),
  getPartnershipById
);
router.put(
  "/update-status/:id",
  protect,
  requireRole("admin"),
  updatePartnershipStatus
);
router.post(
  "/apply-partnership",
  protect,
  cloudinaryUpload.single("profilePicture"),
  createPartnership
);
router.put("/update/:id", protect, updatePartnership);
router.delete("/delete/:id", protect, deletePartnership);
router.delete("/delete-partnership/:id", protect, deleteMyPartnership);
router.put("/cancel/:id", protect, cancelMyPartnershipRequest);
router.get("/my-partnerships", protect, getMyPartnerships);
router.get("/all-partner", allPartnership);

export default router;
