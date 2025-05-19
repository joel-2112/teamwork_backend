const express = require('express');
const router = express.Router();
const JobController = require('../controllers/JobController');

router.post('/', JobController.createJob);
router.get('/', JobController.getAllJobs);
router.get('/:id', JobController.getJobById);
router.put('/:id', JobController.updateJob);
router.delete('/:id', JobController.deleteJob);

module.exports = router;