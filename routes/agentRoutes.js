import express from "express";
const router = express.Router();
import {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  updateAgentStatus,
  getAllDeletedAgent,
  getMyAgentRequest
} from "../controllers/agentController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";

router.post("/apply-agent", protect, createAgent);
router.get("/all-agents", protect, requireRole("admin"), getAllAgents);
router.get("/agent/:id", protect, requireRole("admin"), getAgentById);
router.put("/update/:id", protect, requireRole("admin"), updateAgent);
router.delete("/delete/:id", protect, requireRole("admin"), deleteAgent);
router.put("/update-status/:id", protect, requireRole("admin"), updateAgentStatus);
router.get("/deleted-agents", protect, requireRole("admin"), getAllDeletedAgent);
router.get("/my-request", protect, getMyAgentRequest);
export default router;
