import db from "../models/index.js";
import { Op, fn, col } from "sequelize";

const { Message, User, Role, Agent } = db;

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
  const assistant = await Role.findOne({ where: { name: "assistant" } });
  if (!assistant) throw new Error("Assistant role not found");

  const senders = await User.findAll({
    include: [
      {
        model: Message,
        as: "sentMessages",
        attributes: [],
        required: true,
        where: { receiverId: { [Op.ne]: null } },
      },
      {
        model: Role,
        attributes: ["name"],
      },
      {
        model: Agent,
        as: "agents",
        attributes: ["agentType"],
      },
    ],
    attributes: [
      "id",
      "name",
      "profilePicture",
      "email",
      "regionId",
      "zoneId",
      "woredaId",
    ],
    where: { roleId: { [Op.ne]: assistant.id } },
    group: ["User.id", "Role.id", "agents.id"],
  });

  const sendersWithUnreadCounts = await Promise.all(
    senders.map(async (sender) => {
      const unreadCount = await Message.count({
        where: {
          senderId: sender.id,
          receiverId: { [Op.ne]: null },
          isRead: false,
        },
      });

      const senderJson = sender.toJSON();

      // If the sender's role is agent, keep their agents array; else, set to []
      const agents =
        senderJson.Role.name === "agent"
          ? senderJson.Agents // keep whatever agentType(s) they have
          : [];

      return {
        ...senderJson,
        Agents: agents,
        unreadMessages: unreadCount,
      };
    })
  );

  return sendersWithUnreadCounts.sort(
    (a, b) => b.unreadMessages - a.unreadMessages
  );
};



export const getConversationService = async (currentUserId, otherUserId) => {
  // Only fetch the conversation; do not auto-mark as read here
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

// New service to mark messages as read for a specific user (for assistants)
export const markMessagesAsReadService = async (assistantId, senderId) => {
  const result = await Message.update(
    { isRead: true },
    {
      where: {
        senderId: senderId,
        receiverId: assistantId,
        isRead: false,
      },
    }
  );

  return result[0]; // Return number of updated rows
};

// New service to get unread message count for a specific user
export const getUnreadMessageCountService = async (assistantId, senderId) => {
  const count = await Message.count({
    where: {
      senderId: senderId,
      receiverId: assistantId,
      isRead: false,
    },
  });

  return count;
};

// New service to get unread message count for regular users from assistants
export const getUserUnreadMessageCountService = async (userId) => {
  const assistant = await Role.findOne({ where: { name: "assistant" } });
  if (!assistant) throw new Error("Assistant role not found");

  const count = await Message.count({
    where: {
      senderId: { [Op.ne]: userId }, // messages not sent by the user
      receiverId: userId,
      isRead: false,
    },
  });

  return count;
};

// New service to mark messages as read for regular users
export const markUserMessagesAsReadService = async (userId) => {
  const result = await Message.update(
    { isRead: true },
    {
      where: {
        receiverId: userId,
        isRead: false,
      },
    }
  );

  return result[0]; // Return number of updated rows
};
