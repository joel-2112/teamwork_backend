import express from 'express';
const router = express.Router();
import {
    createEventController,
    getAllEventsController,
    getEventByIdController,
    updateEventController,
    deleteEventController
} from '../controllers/eventController.js';

router.post('/', createEventController);
router.get('/', getAllEventsController);
router.get('/:id', getEventByIdController);
router.put('/:id', updateEventController);
router.delete('/:id', deleteEventController);

export default router;