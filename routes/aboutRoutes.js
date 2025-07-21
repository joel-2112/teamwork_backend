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
router.get("/", getAllAbout);
router.get("/:id", getAboutById);
router.put("/:id", updateAbout);
router.delete("/:id", deleteAbout);

export default router;
