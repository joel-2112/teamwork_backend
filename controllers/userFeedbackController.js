import {
  createUserFeedbackService,
  getAllUserFeedbacksService,
  getUserFeedbackByIdService,
  updateUserFeedbackService,
  deleteUserFeedbackService,
  updateUserFeedbackStatusService,
  averageRatingService,
  testimonyServices,
} from "../services/userFeadbackService.js";

export const createUserFeedback = async (req, res) => {
  try {
    const feedback = await createUserFeedbackService(req.body);
    res.status(201).json({
      success: true,
      message: "You have sent your feedback successfully.",
      feedback: feedback,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllUserFeedbacks = async (req, res) => {
  try {
    const { page, limit, status, feedbackType, search } = req.query;
    const feedbacks = await getAllUserFeedbacksService({
      page,
      limit,
      status,
      feedbackType,
      search,
    });
    res.status(200).json({
      success: true,
      message: "All user feedback retrieved successfully.",
      statistics: feedbacks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const averageRating = async (req, res) => {
  try {
    const result = await averageRatingService();

    res.status(200).json({
      success: true,
      message: "Average rating retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error getting average rating:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve average rating",
      error: error.message,
    });
  }
};

export const getUserFeedbackById = async (req, res) => {
  try {
    const feedback = await getUserFeedbackByIdService(req.params.id);
    res.status(200).json({
      success: true,
      message: `feedback with id ${req.params.id} is:`,
      feedback: feedback,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const updateUserFeedback = async (req, res) => {
  try {
    const feedback = await updateUserFeedbackService(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Feedbacke updated successfully.",
      feedback: feedback,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteUserFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const userId = req.user.id;
    await deleteUserFeedbackService(feedbackId, userId);
    res.status(200).json({
      success: true,
      message: `Feedback with id ${feedbackId} is deleted successfully.`,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateUserFeedbackStatus = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const userId = req.user.id;
    const { status } = req.body;
    const feedback = await updateUserFeedbackStatusService(
      feedbackId,
      userId,
      status
    );
    res.status(200).json({
      success: true,
      message: `You have successfully ${status} feedback with id ${feedbackId}`,
      feedback: feedback,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const testimony = async (req, res) => {
  try {
    const testimony = await testimonyServices();
    res
      .status(200)
      .json({
        success: true,
        message: "Testimony retrieved successfully.",
        testimony,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
