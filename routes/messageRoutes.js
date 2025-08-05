import express from "express";
import {
  sendMessage,
  getConversation,
} from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, sendMessage);
router.get("/conversation/:userId", protect, getConversation);

export default router;
