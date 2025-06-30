import express from 'express';
const router = express.Router();
import {
    createJob,
    getOpenJobs,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob
} from '../controllers/jobController.js';
//the jobController is imported from the controllers folder
router.post('/', createJob);
router.get('/open', getOpenJobs);
router.get('/', getAllJobs);
router.get('/:id', getJobById);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

export default router;