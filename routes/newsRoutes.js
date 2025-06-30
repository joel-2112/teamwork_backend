import express from 'express';
const router = express.Router();
import {
    createNewsController,
    getAllNewsController,
    getNewsByIdController,
    updateNewsController,
    deleteNewsController
} from '../controllers/newsController.js';

//the news routes
router.post('/', createNewsController);
router.get('/', getAllNewsController);
router.get('/:id', getNewsByIdController);
router.put('/:id', updateNewsController);
router.delete('/:id', deleteNewsController);

export default router;