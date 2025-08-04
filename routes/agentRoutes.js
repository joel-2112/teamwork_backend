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
  getMyAgentRequest,
  getAllApprovedAgents,
  cancelAgent,
} from "../controllers/agentController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

router.post(
  "/apply-agent",
  protect,
  upload.single("profilePicture"),
  createAgent
);
router.get(
  "/all-agents",
  protect,
  requireRole("admin", "regionAdmin", "zoneAdmin", "woredaAdmin"),
  getAllAgents
);
router.get("/agent/:id", protect, requireRole("admin"), getAgentById);
router.put("/update/:id", protect, updateAgent);
router.delete("/delete/:id", protect, requireRole("admin"), deleteAgent);
router.put(
  "/update-status/:id",
  protect,
  requireRole("admin"),
  updateAgentStatus
);
router.get(
  "/deleted-agents",
  protect,
  requireRole("admin"),
  getAllDeletedAgent
);
router.get("/my-request", protect, getMyAgentRequest);
router.get("/approved-agents", getAllApprovedAgents);
router.put("/cancel:id", protect, cancelAgent);

export default router;
