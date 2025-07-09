import { Op } from "sequelize";
import db from "../models/index.js"; // ensure index.js uses ESM exports
import { title } from "process";
const { Job, JobApplication } = db;

// Service to create job if it is not already exist
export const createJobService = async (data) => {
  const job = await Job.findOne({
    where: {
      title: data.title,
      companyName: data.companyName,
      location: data.location,
    },
  });

  if (job) throw new Error("Job already exist.");

  return await Job.create(data);
};


// Service Retrieve all job with pagination
export const getAllJobsService = async ({
  page = 1,
  limit = 10,
  category,
  location,
  jobType,
  jobStatus,
  search,
} = {}) => {
  const offset = (page - 1) * limit;
  const where = {};

  if (category) where.category = category;
  if (location) where.location = { [Op.iLike]: `%${location}%` };
  if (jobType) where.jobType = jobType;
  if(jobStatus) where.jobStatus = jobStatus;
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { companyName: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Job.findAndCountAll({
    where,
    include: [
      {
        model: JobApplication,
        as: "JobApplications",
        required: false,
        attributes: [
          "id",
          "applicantFullName",
          "applicantEmail",
          "status",
          "createdAt",
        ],
      },
    ],
    distinct: true,
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    jobs: rows,
  };
};

// Service to retrieve job by id
export const getJobByIdService = async (id) => {
  const job = await Job.findByPk(id, {
    include: [
      {
        model: JobApplication,
        as: "JobApplications",
        required: false,
        attributes: [
          "id",
          "applicantFullName",
          "applicantEmail",
          "status",
          "createdAt",
        ],
      },
    ],
  });
  if (!job) throw new Error("Job not found");
  return job;
};


// Service Update job by id
export const updateJobService = async (id, data) => {
  const job = await Job.findByPk(id);
  if (!job) throw new Error("Job not found");
  return await job.update(data);
};


// Service to delte job by id
export const deleteJobService = async (id) => {
  const job = await Job.findByPk(id);
  if (!job) throw new Error("Job not found");
  const applicationCount = await JobApplication.count({ where: { jobId: id } });
  if (applicationCount > 0)
    throw new Error("Cannot delete job with associated applications");
  return await job.destroy();
};


// Service to retrieve open job
export const getOpenJobsService = async ({
  page = 1,
  limit = 10,
  category,
  location,
  jobType,
  search,
} = {}) => {
  const offset = (page - 1) * limit;
  const where = { jobStatus: "open" };

  if (category) where.category = category;
  if (location) where.location = { [Op.iLike]: `%${location}%` };
  if (jobType) where.jobType = jobType;
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { companyName: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Job.findAndCountAll({
    where,
    include: [
      {
        model: JobApplication,
        as: "JobApplications",
        required: false,
        attributes: [
          "id",
          "applicantFullName",
          "applicantEmail",
          "status",
          "createdAt",
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    jobs: rows,
  };
};

// Close the open job
export const closeOpenJobService = async (id, jobStatus) => {
  const job = await Job.findByPk(id);

  if (!job) throw new Error("Job not found.");
  if (job.jobStatus !== "open") throw new Error("Job is already closed");

  job.jobStatus = "closed";
  await job.save();
  return job;
};

// Service to retrieve all closed job
export const getAllClosedJobService = async ({
  page = 1,
  limit = 10,
  category,
  location,
  jobType,
  search,
} = {}) => {
  const offset = (page - 1) * limit;
  const where = { jobStatus: "closed" };

  if (category) where.category = category;
  if (location) where.location = { [Op.iLike]: `%${location}%` };
  if (jobType) where.jobType = jobType;
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { companyName: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Job.findAndCountAll({
    where,
    include: [
      {
        model: JobApplication,
        as: "JobApplications",
        required: false,
        attributes: [
          "id",
          "applicantFullName",
          "applicantEmail",
          "status",
          "createdAt",
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    jobs: rows,
  };
};
