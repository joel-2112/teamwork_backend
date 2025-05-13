const express = require('express');
const router = express.Router();
const jobApplicationConroller = require('../controllers/jobApplicationController');
// router.post('/', upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'coverLetter', maxCount: 1 }]), jobApplicationConroller.submitApplication);
router.get('/',  jobApplicationConroller.getAllApplications);
router.get('/:id',  jobApplicationConroller.getApplicationById);
router.patch('/:id/status',  jobApplicationConroller.updateApplicationStatus);

module.exports = router;