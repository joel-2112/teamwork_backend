import { Op } from "sequelize";
import db from "../models/index.js";
import {
  sendMessageService,
  getConversationService,
  replyMessageService,
  getAllSendersService,
} from "../services/messageService.js";
const { Message, User } = db;

// Send message controller
export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const senderId = req.user.id;

    const message = await sendMessageService(senderId, content);

    res
      .status(201)
      .json({ success: true, message: "Message sent successfully.", message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send message controller
export const replyMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user.id;

    const message = await replyMessageService(senderId, receiverId, content);

    res
      .status(201)
      .json({ success: true, message: "Message sent successfully.", message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllSenders = async (req, res) => {
  try {
    const senders = await getAllSendersService();
    res.status(200).json({
      success: true,
      message: "Senders fetched successfully",
      data: senders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get conversation with a specific user
export const getConversation = async (req, res) => {
  try {
    const otherUserId = parseInt(req.params.id);
    const currentUserId = req.user.id;

    const messages = await getConversationService(currentUserId, otherUserId);

    res.status(200).json({
      success: true,
      messages: "Messages retrieved successfully.",
      messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
