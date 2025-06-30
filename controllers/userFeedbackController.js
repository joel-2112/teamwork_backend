import {
  createUserFeedbackService,
  getAllUserFeedbacksService,
  getUserFeedbackByIdService,
  updateUserFeedbackService,
  deleteUserFeedbackService,
  updateUserFeedbackStatusService,
} from '../services/userFeadbackService.js';

export const createUserFeedback = async (req, res) => {
  try {
    const feedback = await createUserFeedbackService(req.body);
    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllUserFeedbacks = async (req, res) => {
  try {
    const { page, limit, status, feedbackType } = req.query;
    const feedbacks = await getAllUserFeedbacksService({ page, limit, status, feedbackType });
    res.status(200).json({ success: true, data: feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getUserFeedbackById = async (req, res) => {
  try {
    const feedback = await getUserFeedbackByIdService(req.params.id);
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

export const updateUserFeedback = async (req, res) => {
  try {
    const feedback = await updateUserFeedbackService(req.params.id, req.body);
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteUserFeedback = async (req, res) => {
  try {
    await deleteUserFeedbackService(req.params.id);
    res.status(204).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateUserFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const feedback = await updateUserFeedbackStatusService(req.params.id, status);
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
