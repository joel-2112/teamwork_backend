import express from 'express';
const router = express.Router();
import {
    createNewsController,
    getAllNewsController,
    getNewsByIdController,
    updateNewsController,
    deleteNewsController
} from '../controllers/newsController.js';
import { protect, requireRole } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validators/validateRequest.js';
import { createNewsValidator, validateParamId } from "../middlewares/validators/authValidator.js"
import upload from '../middlewares/upload.js'; 


//the news routes
router.post('/create-news', upload.single('picture'), createNewsValidator, validateRequest, protect, requireRole('admin'), createNewsController);
router.put('/update-news/:id', protect, requireRole('admin'), updateNewsController);
router.delete('/delete-news/:id', validateParamId, validateRequest, deleteNewsController);
router.get('/news/:id', validateParamId, validateRequest, getNewsByIdController);
router.get('/all-news', getAllNewsController);


export default router;