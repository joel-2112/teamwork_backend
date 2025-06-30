// routes/partnershipRoutes.js
import express from 'express';
const router = express.Router();
import  {
  createPartnership,
  getAllPartnerships,
  getPartnershipById,
  updatePartnership,
  deletePartnership,
  updatePartnershipStatus,
} from '../controllers/partnershipController.js';

router.post('/', createPartnership);
router.get('/', getAllPartnerships);
router.get('/:id', getPartnershipById);
router.put('/:id', updatePartnership);
router.delete('/:id', deletePartnership);
router.put('/:id/status', updatePartnershipStatus);

export default router;