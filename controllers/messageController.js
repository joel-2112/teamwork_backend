import { Op, where } from "sequelize";
import db from "../models/index.js";
import {
  sendMessageService,
  getConversationService,
  replyMessageService,
  getAllSendersService,
  markMessagesAsReadService,
  getUnreadMessageCountService,
  getUserUnreadMessageCountService,
  markUserMessagesAsReadService,
} from "../services/messageService.js";
const { Message, User, Role } = db;

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
    console.error("Error in getAllSenders:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// New controller to mark messages as read for a specific user (for assistants)
export const markMessagesAsRead = async (req, res) => {
  try {
    const assistantId = req.user.id;
    const senderId = parseInt(req.params.id);

    if (!senderId) {
      return res.status(400).json({
        success: false,
        message: "Sender ID is required",
      });
    }

    const updatedCount = await markMessagesAsReadService(assistantId, senderId);

    res.status(200).json({
      success: true,
      message: `Marked ${updatedCount} messages as read`,
      updatedCount,
    });
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// New controller to get unread message count for a specific user (for assistants)
export const getUnreadMessageCount = async (req, res) => {
  try {
    const assistantId = req.user.id;
    const senderId = parseInt(req.params.id);

    if (!senderId) {
      return res.status(400).json({
        success: false,
        message: "Sender ID is required",
      });
    }

    const count = await getUnreadMessageCountService(assistantId, senderId);

    res.status(200).json({
      success: true,
      message: "Unread message count retrieved successfully",
      count,
    });
  } catch (error) {
    console.error("Error in getUnreadMessageCount:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// New controller to get unread message count for regular users
export const getUserUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await getUserUnreadMessageCountService(userId);

    res.status(200).json({
      success: true,
      message: "Unread message count retrieved successfully",
      count,
    });
  } catch (error) {
    console.error("Error in getUserUnreadMessageCount:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// New controller to mark messages as read for regular users
export const markUserMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const updatedCount = await markUserMessagesAsReadService(userId);

    res.status(200).json({
      success: true,
      message: `Marked ${updatedCount} messages as read`,
      updatedCount,
    });
  } catch (error) {
    console.error("Error in markUserMessagesAsRead:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get conversation with a specific user
export const getConversation = async (req, res) => {
  try {
    // Get assistant role
    const assistantRole = await Role.findOne({ where: { name: "assistant" } });
    if (!assistantRole) {
      return res
        .status(404)
        .json({ success: false, message: "Assistant role not found." });
    }

    // Get the current logged-in user's role
    const currentUser = await User.findByPk(req.user.id);
    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "Logged-in user not found." });
    }

    let otherUserId;

    if (currentUser.roleId === assistantRole.id) {
      // Logged-in user is an assistant → allow fetching conversation with any userId from params
      if (!req.params.id) {
        return res.status(400).json({
          success: false,
          message: "User ID is required in params for assistant.",
        });
      }
      otherUserId = parseInt(req.params.id);
    } else {
      // Logged-in user is a normal user → they can only converse with the assistant
      const assistantUser = await User.findOne({
        where: { roleId: assistantRole.id },
      });
      if (!assistantUser) {
        return res
          .status(404)
          .json({ success: false, message: "No assistant user found." });
      }
      otherUserId = assistantUser.id;
    }

    const messages = await getConversationService(currentUser.id, otherUserId);

    res.status(200).json({
      success: true,
      message: "Messages retrieved successfully.",
      data: messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
