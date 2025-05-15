const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { jobDataValidator } = require('../middlewares/validators/authValidator');
const protect = require('../middlewares/authMiddleware');

router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);
router.post('/', jobDataValidator(), jobController.createJob);
router.put('/:id', protect, jobDataValidator(true), jobController.updateJob);
router.delete('/:id', protect, jobController.deleteJob);

module.exports = router;