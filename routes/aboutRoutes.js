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

router.post("/create-about", upload.single("aboutImage"), createAbout);
router.get("/all-abouts", getAllAbout);
router.get("/about/:id", getAboutById);
router.put("/update/:id", upload.single("aboutImage"), updateAbout);
router.delete("/delete/:id", deleteAbout);

export default router;
