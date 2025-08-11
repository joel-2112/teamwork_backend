import express from "express";
import {
  sendMessage,
  getConversation,
  replyMessage,
  getAllSenders,
} from "../controllers/messageController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, sendMessage);
router.get("/conversation", protect, getConversation); 
router.get("/conversation/:id", protect, requireRole('assistant'), getConversation); 
router.post("/reply/:id", protect, requireRole("assistant"), replyMessage);
router.get("/all-senders", protect, requireRole("assistant"), getAllSenders);

export default router;
