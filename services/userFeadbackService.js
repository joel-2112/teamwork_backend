import { Op } from 'sequelize';
import db from '../models/index.js';
const { UserFeedback } = db;


export const createUserFeedbackService = async (data) => {
  const requiredFields = ['fullName', 'email', 'feedbackType', 'message'];
  for (const field of requiredFields) {
    if (!data[field]) throw new Error(`Missing required field: ${field}`);
  }
  if (data.rating && (data.rating < 1 || data.rating > 5)) {
    throw new Error('Rating must be between 1 and 5');
  }
  return await UserFeedback.create(data);
};

export const getAllUserFeedbacksService = async ({ page = 1, limit = 10, status, feedbackType } = {}) => {
  const offset = (page - 1) * limit;
  const where = {};
  if (status) where.status = status;
  if (feedbackType) where.feedbackType = feedbackType;

  const { count, rows } = await UserFeedback.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    feedbacks: rows,
  };
};

export const getUserFeedbackByIdService = async (id) => {
  const feedback = await UserFeedback.findByPk(id);
  if (!feedback) throw new Error('Feedback not found');
  return feedback;
};

export const updateUserFeedbackService = async (id, data) => {
  const feedback = await UserFeedback.findByPk(id);
  if (!feedback) throw new Error('Feedback not found');
  if (data.rating && (data.rating < 1 || data.rating > 5)) {
    throw new Error('Rating must be between 1 and 5');
  }
  return await feedback.update(data);
};

export const deleteUserFeedbackService = async (id) => {
  const feedback = await UserFeedback.findByPk(id);
  if (!feedback) throw new Error('Feedback not found');
  return await feedback.destroy();
};

export const updateUserFeedbackStatusService = async (id, status) => {
  const feedback = await UserFeedback.findByPk(id);
  if (!feedback) throw new Error('Feedback not found');
  return await feedback.update({ status });
};
