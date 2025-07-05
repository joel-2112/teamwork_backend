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

export const createJob = async (req, res) => {
  try {
    const job = await createJobService(req.body);
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

export const getAllJobs = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const jobs = await getAllJobsService({ page, limit });
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

export const deleteJob = async (req, res) => {
  try {
    await deleteJobService(req.params.id);
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
