const {
  createJobService,
  getAllJobsService,
  getJobByIdService,
  updateJobService,
  deleteJobService,
  getOpenJobsService,
} = require('../services/jobService');

const createJob = async (req, res) => {
  try {
    const job = await createJobService(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const jobs = await getAllJobsService({ page, limit });
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await getJobByIdService(req.params.id);
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await updateJobService(req.params.id, req.body);
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    await deleteJobService(req.params.id);
    res.status(204).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getOpenJobs = async (req, res) => {
  try {
    const { page, limit, category, location, jobType, search } = req.query;
    const jobs = await getOpenJobsService({
      page,
      limit,
      category,
      location,
      jobType,
      search,
    });
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getOpenJobs,
};