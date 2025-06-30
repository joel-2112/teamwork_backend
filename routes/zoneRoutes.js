import express from 'express';
const router = express.Router();
import  {
    createZoneController,
    getAllZonesController,
    getZoneByIdController,
    updateZoneController,
    deleteZoneController
} from '../controllers/zoneController.js';

router.post('/', createZoneController);
router.get('/', getAllZonesController);
router.get('/:id', getZoneByIdController);
router.put('/:id', updateZoneController);
router.delete('/:id', deleteZoneController);

export default router;