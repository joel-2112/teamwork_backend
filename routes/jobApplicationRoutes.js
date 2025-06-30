import express from 'express';
const router = express.Router();
import  {
    createJobApplication,
    getApplicationsByJobId,
    getJobApplicationById,
    updateApplicationStatus,
    deleteJobApplication,
} from '../controllers/jobApplicationController.js';

router.post('/', createJobApplication);
router.get('/job/:jobId', getApplicationsByJobId);
router.get('/:id', getJobApplicationById);
router.put('/:id/status', updateApplicationStatus);
router.delete('/:id', deleteJobApplication);

export default router;