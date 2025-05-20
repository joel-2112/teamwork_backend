// routes/partnershipRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPartnership,
  getAllPartnerships,
  getPartnershipById,
  updatePartnership,
  deletePartnership,
  updatePartnershipStatus,
} = require('../controllers/partnershipController');

router.post('/', createPartnership);
router.get('/', getAllPartnerships);
router.get('/:id', getPartnershipById);
router.put('/:id', updatePartnership);
router.delete('/:id', deletePartnership);
router.put('/:id/status', updatePartnershipStatus);

module.exports = router;