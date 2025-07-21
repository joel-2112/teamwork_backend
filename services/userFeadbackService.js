import { Op } from "sequelize";
import db from "../models/index.js";
const { UserFeedback, User } = db;

// Send(create user feedback)
export const createUserFeedbackService = async (data) => {
  const requiredFields = ["fullName", "email", "feedbackType", "message"];
  for (const field of requiredFields) {
    if (!data[field]) throw new Error(`Missing required field: ${field}`);
  }
  if (data.rating && (data.rating < 1 || data.rating > 5)) {
    throw new Error("Rating must be between 1 and 5");
  }
  const existingFeedback = await UserFeedback.findOne({
    where: {
      email: data.email,
      feedbackType: data.feedbackType,
      message: data.message,
    },
  });
  if (existingFeedback) {
    throw new Error("You have already submitted this feedback.");
  }

  const feedback = await UserFeedback.create(data);
  return feedback;
};

// Retrieve all user feedback
export const getAllUserFeedbacksService = async ({
  page = 1,
  limit = 10,
  status,
  feedbackType,
} = {}) => {
  const offset = (page - 1) * limit;
  const where = {};
  if (status) where.status = status;
  if (feedbackType) where.feedbackType = feedbackType;

  const { count, rows } = await UserFeedback.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  const suggestionsCount = await UserFeedback.count({
    where: { feedbackType: "suggestion" },
  });

  const complaintsCount = await UserFeedback.count({
    where: { feedbackType: "complaint" },
  });

  const praisesCount = await UserFeedback.count({
    where: { feedbackType: "praise" },
  });

  const bugReportsCount = await UserFeedback.count({
    where: { feedbackType: "bug_report" },
  });

  return {
    total: count,
    suggestions: suggestionsCount,
    complaints: complaintsCount,
    praises: praisesCount,
    bugReports: bugReportsCount,
    page: parseInt(page),
    limit: parseInt(limit),
    feedbacks: rows,
  };
};

// Retrieve user feedback by ID
export const getUserFeedbackByIdService = async (id) => {
  const feedback = await UserFeedback.findByPk(id);
  if (!feedback) throw new Error("Feedback not found");

  feedback.status = "reviewed";
  await feedback.save();

  return feedback;
};


// Update user feedback by ID
export const updateUserFeedbackService = async (id, data) => {
  const feedback = await UserFeedback.findByPk(id);
  if (!feedback) throw new Error("Feedback not found");
  if (data.rating && (data.rating < 1 || data.rating > 5)) {
    throw new Error("Rating must be between 1 and 5");
  }
  return await feedback.update(data);
};

// Delete user feedback by ID
export const deleteUserFeedbackService = async (feedbackId, userId) => {
  const feedback = await UserFeedback.findByPk(feedbackId);
  if (!feedback) throw new Error("Feedback not found");

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  feedback.isDeleted = true;
  feedback.deletedBy = user.id;
  feedback.deletedAt = new Date();
  await feedback.save();

  return feedback;
};

// Update user feedback status by ID
export const updateUserFeedbackStatusService = async (
  feedbackId,
  userId,
  status
) => {
  const feedback = await UserFeedback.findByPk(feedbackId);
  if (!feedback) throw new Error("Feedback not found");

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found.");

  const updatedFeedback = await feedback.update({ status });
  return updatedFeedback;
};
