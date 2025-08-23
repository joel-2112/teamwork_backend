import express from "express";
import {
  createTeam,
  getAllTeam,
  getTeamById,
  deleteTeam,
} from "../controllers/teamController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", createTeam);
router.get("/", getAllTeam);
router.get("/:id", getTeamById);
router.delete("/:id", protect, requireRole("admin"), deleteTeam);

export default router;
