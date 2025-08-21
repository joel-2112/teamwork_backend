import express from "express";
import {
  createContactUs,
  getAllContactUs,
  getContactUsById,
  deleteContactUs,
} from "../controllers/contactUsController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", createContactUs);
router.get("/", protect, requireRole("admin"), getAllContactUs);
router.get("/:id", protect, requireRole("admin"), getContactUsById);
router.delete("/:id", protect, requireRole("admin"), deleteContactUs);

export default router;
