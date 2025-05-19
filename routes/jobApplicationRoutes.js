const express = require('express');
const router = express.Router();
const JobApplicationController = require('../controllers/JobApplicationController');

router.post('/', JobApplicationController.createJobApplication);
router.get('/', JobApplicationController.getAllJobApplications);
router.get('/:id', JobApplicationController.getJobApplicationById);
router.put('/:id', JobApplicationController.updateJobApplication);
router.delete('/:id', JobApplicationController.deleteJobApplication);

module.exports = router;