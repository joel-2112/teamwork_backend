// routes/userFeedbackRoutes.js
import express from 'express';
const router = express.Router();
import {
  createUserFeedback,
  getAllUserFeedbacks,
  getUserFeedbackById,
  updateUserFeedback,
  deleteUserFeedback,
  updateUserFeedbackStatus,
} from '../controllers/userFeedbackController.js';

router.post('/', createUserFeedback);
router.get('/', getAllUserFeedbacks);
router.get('/:id', getUserFeedbackById);
router.put('/:id', updateUserFeedback);
router.delete('/:id', deleteUserFeedback);
router.put('/:id/status', updateUserFeedbackStatus);

export default router;