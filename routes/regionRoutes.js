import express from 'express';
const router = express.Router();
import  {
    createRegionController,
    getAllRegionsController,
    getRegionByIdController,
    updateRegionController,
    deleteRegionController
} from '../controllers/regionController.js';

router.post('/', createRegionController);
router.get('/', getAllRegionsController);
router.get('/:id', getRegionByIdController);
router.put('/:id', updateRegionController);
router.delete('/:id', deleteRegionController);

export default router;