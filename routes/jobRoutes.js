const express = require('express');
const router = express.Router();
const JobController = require('../controllers/jobController');
//the jobController is imported from the controllers folder
router.post('/', JobController.createJob);
router.get('/open', JobController.getOpenJobs);
router.get('/', JobController.getAllJobs);
router.get('/:id', JobController.getJobById);
router.put('/:id', JobController.updateJob);
router.delete('/:id', JobController.deleteJob);

module.exports = router;