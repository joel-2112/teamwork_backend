import { Op } from "sequelize";
import db from "../models/index.js";
import moment from "moment";

const { Job, JobApplication, User } = db;

// Service to create job if it is not already exist
export const createJobService = async (userId, data) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const job = await Job.findOne({
    where: {
      title: data.title,
      companyName: data.companyName,
      location: data.location,
    },
  });

  if (job) throw new Error("Job already exist.");

  return await Job.create({
    ...data,
    postedBy: user.id,
  });
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
  const where = { isDeleted: false };

  if (category) where.category = category;
  if (location) where.location = { [Op.iLike]: `%${location}%` };
  if (jobType) where.jobType = jobType;
  if (jobStatus) where.jobStatus = jobStatus;
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
        as: "applications",
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

  const totalJobs = await Job.count({ where: { isDeleted: false } });

  return {
    total: totalJobs,
    page: parseInt(page),
    limit: parseInt(limit),
    jobs: rows,
  };
};

// Service to retrieve job by id
export const getJobByIdService = async (id) => {
  const where = { id: id, isDeleted: false };
  const job = await Job.findOne({
    where,
    include: [
      {
        model: JobApplication,
        as: "applications",
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
  const job = await Job.findOne({ where: { id: id, isDeleted: false } });
  if (!job) throw new Error("Job not found");
  return await job.update(data);
};

// Service to delete job by id
export const deleteJobService = async (jobId, userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");
  const job = await Job.findOne({ where: { id: jobId, isDeleted: false } });
  if (!job) throw new Error("Job not found or already deleted.");
  const applicationCount = await JobApplication.count({
    where: { jobId: jobId },
  });
  if (applicationCount > 0)
    throw new Error("Cannot delete job with associated applications");

  job.isDeleted = true;
  job.deletedBy = user.id;
  job.deletedAt = new Date();
  await job.save();

  return job;
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
  const where = { jobStatus: "open", isDeleted: false };

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
        as: "applications",
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
  const job = await Job.findOne({ where: { id: id } });
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
  const where = { jobStatus: "closed", isDeleted: false };

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
        as: "applications",
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

// To send Job statistics of the company
export const jobStatisticsService = async () => {
  // === Time ranges ===
  const todayStart = moment().startOf("day").toDate();
  const todayEnd = moment().endOf("day").toDate();

  const monthStart = moment().startOf("month");
  const monthEnd = moment().endOf("month");

  // Divide the current month into four weeks
  const weekOneStart = moment(monthStart).toDate();
  const weekOneEnd = moment(monthStart).add(6, "days").endOf("day").toDate();

  const weekTwoStart = moment(monthStart)
    .add(7, "days")
    .startOf("day")
    .toDate();
  const weekTwoEnd = moment(monthStart).add(13, "days").endOf("day").toDate();

  const weekThreeStart = moment(monthStart)
    .add(14, "days")
    .startOf("day")
    .toDate();
  const weekThreeEnd = moment(monthStart).add(20, "days").endOf("day").toDate();

  const weekFourStart = moment(monthStart)
    .add(21, "days")
    .startOf("day")
    .toDate();
  const weekFourEnd = moment(monthEnd).toDate();

  // === Count users ===
  const todayJobs = await Job.count({
    where: {
      isDeleted: false,
      createdAt: { [Op.between]: [todayStart, todayEnd] },
    },
  });

  const weekOneJobs = await Job.count({
    where: {
      isDeleted: false,
      createdAt: { [Op.between]: [weekOneStart, weekOneEnd] },
    },
  });

  const weekTwoJobs = await Job.count({
    where: {
      isDeleted: false,
      createdAt: { [Op.between]: [weekTwoStart, weekTwoEnd] },
    },
  });

  const weekThreeJobs = await Job.count({
    where: {
      isDeleted: false,
      createdAt: { [Op.between]: [weekThreeStart, weekThreeEnd] },
    },
  });

  const weekFourJobs = await Job.count({
    where: {
      isDeleted: false,
      createdAt: { [Op.between]: [weekFourStart, weekFourEnd] },
    },
  });

  const thisMonthJobs = await Job.count({
    where: {
      isDeleted: false,
      createdAt: { [Op.between]: [monthStart.toDate(), monthEnd.toDate()] },
    },
  });

  const totalJobs = await Job.count({ where: { isDeleted: false } });

  const openJobs = await Job.count({
    where: { jobStatus: "open", isDeleted: false },
  });

  const closedJobs = await Job.count({
    where: { jobStatus: "closed", isDeleted: false },
  });
  const fullTimeJobs = await Job.count({
    where: { jobType: "full-time", isDeleted: false },
  });
  const partTimeJobs = await Job.count({
    where: { jobType: "part-time", isDeleted: false },
  });
  const contractJobs = await Job.count({
    where: { jobType: "contract", isDeleted: false },
  });
  const remoteJobs = await Job.count({
    where: { jobType: "remote", isDeleted: false },
  });
  const internshipJobs = await Job.count({
    where: { jobType: "internship", isDeleted: false },
  });

  return {
    totalJobs,
    openJobs,
    closedJobs,
    todayJobs,
    weekOneJobs,
    weekTwoJobs,
    weekThreeJobs,
    weekFourJobs,
    thisMonthJobs,
    fullTimeJobs,
    partTimeJobs,
    contractJobs,
    remoteJobs,
    internshipJobs,
  };
};
