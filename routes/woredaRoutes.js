import  express from 'express';
const router = express.Router();
import {
    createWoredaController,
    getAllWoredasController,
    getWoredaByIdController,
    updateWoredaController,
    deleteWoredaController
} from '../controllers/woredaController.js';

router.post('/', createWoredaController);
router.get('/', getAllWoredasController);
router.get('/:id', getWoredaByIdController);
router.put('/:id', updateWoredaController);
router.delete('/:id', deleteWoredaController);

export default router;