import db from "../models/index.js";
import { Op, where } from "sequelize";

const { Message, User, Role } = db;

export const sendMessageService = async (senderId, content) => {
  const assistant = await Role.findOne({ where: { name: "assistant" } });
  if (!assistant) throw new Error("assistant role is not found.");

  const user = await User.findOne({ where: { roleId: assistant.id } });
  if (!user) throw new Error("User with assistant Role is not found.");

  const message = await Message.create({
    senderId,
    receiverId: user.id,
    content,
  });

  return message;
};

export const replyMessageService = async (senderId, receiverId, content) => {
  const message = await Message.create({
    senderId,
    receiverId,
    content,
  });

  return message;
};

export const getAllSendersService = async () => {
  const assistant = await Role.findOne({where: {name: "assistant"}})
  const senders = await User.findAll({
    include: [
      {
        model: Message,
        as: "sentMessages",
        attributes: [], // don't need message details
      },
    ],
    attributes: ["id", "name", "profilePicture", "email"], // adjust based on your User model
    where: {
      "$sentMessages.id$": { [Op.ne]: null }, // only users with at least one sent message
      roleId: { [Op.ne]: assistant.id }, // exclude users with role 'assistant'
    },
    group: ["User.id"], // ensure unique senders
  });

  return senders;
};

export const getConversationService = async (currentUserId, otherUserId) => {
  // First, mark all messages sent by the other user to the current user as read
  await Message.update(
    { isRead: true },
    {
      where: {
        senderId: otherUserId,
        receiverId: currentUserId,
        isRead: false, // only update unread messages
      },
    }
  );

  // Then fetch the conversation
  const messages = await Message.findAll({
    where: {
      [Op.or]: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    },
    order: [["createdAt", "ASC"]],
  });

  return messages;
};
