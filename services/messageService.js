import db from "../models/index.js";
const { Message } = db;

export const sendMessageService = async (senderId, receiverId, content) => {
  const message = await Message.create({
    senderId,
    receiverId,
    content,
  });

  return message;
};

export const getConversationService = async (currentUserId, otherUserId) => {
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
