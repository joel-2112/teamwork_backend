const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.get('/jobs', jobController.getAllJobs);
router.get('/jobs/:id',jobController.getJobById);
router.post('/jobs', jobController.createJob);
router.put('/jobs/:id', jobController.updateJob);
router.delete('/jobs/:id', jobController.deleteJob);

module.exports = router;