// routes/aboutRoutes.js
import express from "express";
const router = express.Router();
import {
  createAbout,
  getAllAbout,
  getAboutById,
  updateAbout,
  deleteAbout,
} from "../controllers/aboutController.js";
import upload from "../middlewares/upload.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";

router.post("/create-about", protect, requireRole('admin'), upload.single("aboutImage"), createAbout);
router.get("/all-abouts", getAllAbout);
router.get("/about/:id", getAboutById);
router.put("/update/:id", protect, requireRole('admin'), upload.single("aboutImage"), updateAbout);
router.delete("/delete/:id", protect, requireRole('admin'), deleteAbout);

export default router;