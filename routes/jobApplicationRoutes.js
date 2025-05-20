const express = require('express');
const router = express.Router();
const JobApplicationController = require('../controllers/jobApplicationController');

router.post('/', JobApplicationController.createJobApplication);
router.get('/job/:jobId', JobApplicationController.getApplicationsByJobId);
router.get('/:id', JobApplicationController.getJobApplicationById);
router.put('/:id/status', JobApplicationController.updateApplicationStatus);
router.delete('/:id', JobApplicationController.deleteJobApplication);

module.exports = router;