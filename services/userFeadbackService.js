// services/userFeedbackService.js
const { Op } = require('sequelize');
const { UserFeedback } = require('../models');

const createUserFeedbackService = async (data) => {
  const requiredFields = ['fullName', 'email', 'feedbackType', 'message'];
  for (const field of requiredFields) {
    if (!data[field]) throw new Error(`Missing required field: ${field}`);
  }
  if (data.rating && (data.rating < 1 || data.rating > 5)) {
    throw new Error('Rating must be between 1 and 5');
  }
  return await UserFeedback.create(data);
};

const getAllUserFeedbacksService = async ({ page = 1, limit = 10, status, feedbackType } = {}) => {
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

const getUserFeedbackByIdService = async (id) => {
  const feedback = await UserFeedback.findByPk(id);
  if (!feedback) throw new Error('Feedback not found');
  return feedback;
};

const updateUserFeedbackService = async (id, data) => {
  const feedback = await UserFeedback.findByPk(id);
  if (!feedback) throw new Error('Feedback not found');
  if (data.rating && (data.rating < 1 || data.rating > 5)) {
    throw new Error('Rating must be between 1 and 5');
  }
  return await feedback.update(data);
};

const deleteUserFeedbackService = async (id) => {
  const feedback = await UserFeedback.findByPk(id);
  if (!feedback) throw new Error('Feedback not found');
  return await feedback.destroy();
};

const updateUserFeedbackStatusService = async (id, status) => {
  const feedback = await UserFeedback.findByPk(id);
  if (!feedback) throw new Error('Feedback not found');
  return await feedback.update({ status });
};

module.exports = {
  createUserFeedbackService,
  getAllUserFeedbacksService,
  getUserFeedbackByIdService,
  updateUserFeedbackService,
  deleteUserFeedbackService,
  updateUserFeedbackStatusService,
};