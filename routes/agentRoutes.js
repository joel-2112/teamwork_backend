import express from "express";
const router = express.Router();
import {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
} from "../controllers/agentController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";

router.post("/apply-agent", protect, createAgent);
router.get("/all-agents", protect, requireRole("admin"), getAllAgents);
router.get("/agent/:id", protect, requireRole("admin"), getAgentById);
router.put("/update/:id", protect, requireRole("admin"), updateAgent);
router.delete("/delete/:id", protect, requireRole("admin"), deleteAgent);

export default router;
