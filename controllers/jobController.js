const jobService = require('../services/jobService');

const getAllJobs = async (req, res) => {
  try {
    const jobs = await jobService.getAllOpenJobs();
    res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

const createJob = async (req, res) => {
  try {
    const jobData = { ...req.body, userId: req.user.id };
    const job = await jobService.createJob(jobData);
    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await jobService.updateJob(req.params.id, req.body, req.user.id);
    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

const deleteJob = async (req, res) => {
  try {
    await jobService.deleteJob(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Job deleted',
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};