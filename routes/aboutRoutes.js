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
import cloudinaryUpload from "../middlewares/cloudinaryUpload.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";

router.post(
  "/create-about",
  protect,
  requireRole("admin"),
  cloudinaryUpload.single("aboutImage"),
  createAbout
);
router.put(
  "/update/:id",
  protect,
  requireRole("admin"),
  cloudinaryUpload.single("aboutImage"),
  updateAbout
);
router.delete("/delete/:id", protect, requireRole("admin"), deleteAbout);
router.get("/all-abouts", getAllAbout);
router.get("/about/:id", getAboutById);

export default router;
