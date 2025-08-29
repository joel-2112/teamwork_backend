import express from "express";
import {
  createTeam,
  getAllTeam,
  getTeamById,
  deleteTeam,
  updateTeam,
} from "../controllers/teamController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post(
  "/",
  protect,
  upload.single("imageUrl"),
  requireRole("admin"),
  createTeam
);
router.put(
  "/:id",
  protect,
  upload.single("imageUrl"),
  requireRole("admin"),
  updateTeam
);
router.get("/", getAllTeam);
router.get("/:id", getTeamById);
router.delete("/:id", protect, requireRole("admin"), deleteTeam);

export default router;
