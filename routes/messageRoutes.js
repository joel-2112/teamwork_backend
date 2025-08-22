import express from "express";
import {
  sendMessage,
  getConversation,
  replyMessage,
  getAllSenders,
  markMessagesAsRead,
  getUnreadMessageCount,
  getUserUnreadMessageCount,
  markUserMessagesAsRead,
} from "../controllers/messageController.js";
import { protect, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, sendMessage);
router.get("/conversation", protect, getConversation); 
router.get("/conversation/:id", protect, requireRole('assistant'), getConversation); 
router.post("/reply/:id", protect, requireRole("assistant"), replyMessage);
router.get("/all-senders", protect, requireRole("assistant"), getAllSenders);
router.post("/mark-read/:id", protect, requireRole("assistant"), markMessagesAsRead);
router.get("/unread-count/:id", protect, requireRole("assistant"), getUnreadMessageCount);

// New routes for regular users
router.get("/user/unread-count", protect, getUserUnreadMessageCount);
router.post("/user/mark-read", protect, markUserMessagesAsRead);

export default router;
