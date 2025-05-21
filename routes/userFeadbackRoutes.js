// routes/userFeedbackRoutes.js
const express = require('express');
const router = express.Router();
const {
  createUserFeedback,
  getAllUserFeedbacks,
  getUserFeedbackById,
  updateUserFeedback,
  deleteUserFeedback,
  updateUserFeedbackStatus,
} = require('../controllers/userFeedbackController');

router.post('/', createUserFeedback);
router.get('/', getAllUserFeedbacks);
router.get('/:id', getUserFeedbackById);
router.put('/:id', updateUserFeedback);
router.delete('/:id', deleteUserFeedback);
router.put('/:id/status', updateUserFeedbackStatus);

module.exports = router;