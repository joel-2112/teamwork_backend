import {
  createJobService,
  getAllJobsService,
  getJobByIdService,
  updateJobService,
  deleteJobService,
  getOpenJobsService,
  closeOpenJobService,
  getAllClosedJobService,
} from "../services/jobService.js";

// Create job if it is not already exist
export const createJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const job = await createJobService(userId, req.body);
    res.status(200).json({
      success: true,
      message: "JOb created successfully",
      job: job,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Retrieve all job
export const getAllJobs = async (req, res) => {
  try {
    const { page, limit, category, location, jobType, jobStatus, search } =
      req.query;
    const jobs = await getAllJobsService({
      page,
      limit,
      category,
      location,
      jobType,
      jobStatus,
      search,
    });

    res.status(200).json({
      success: true,
      message: "All jobs retrieved successfully.",
      jobs: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Retrieve job by id
export const getJobById = async (req, res) => {
  try {
    const job = await getJobByIdService(req.params.id);
    res.status(200).json({
      success: true,
      message: `Job with id ${req.params.id} is: `,
      job: job,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// Update job by id
export const updateJob = async (req, res) => {
  try {
    const job = await updateJobService(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: ` Job with the id ${req.params.id} is updated successfully.`,
      job: job,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete job by id
export const deleteJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;
    await deleteJobService(jobId, userId);
    res.status(200).json({
      success: true,
      message: "Job deleted successfully.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Retrieve only open job with pagination and filtration
export const getOpenJobs = async (req, res) => {
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
    res.status(200).json({
      success: true,
      message: "Opened job is retrieved successfully.",
      job: jobs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Make close the opened job
export const closeOpenJob = async (req, res) => {
  try {
    const { jobStatus } = req.body;
    const closedJob = await closeOpenJobService(req.params.id, jobStatus);

    res.status(200).json({
      success: true,
      message: "Job successfully closed.",
      job: closedJob,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Retrieve only all closed job with pagination and filtration
export const getAllClosedJob = async (req, res) => {
  try {
    const { page, limit, category, location, jobType, search } = req.query;
    const jobs = await getAllClosedJobService({
      page,
      limit,
      category,
      location,
      jobType,
      search,
    });
    res.status(200).json({
      success: true,
      message: "Closed job is retrieved successfully.",
      job: jobs,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
