import { Op, Sequelize } from "sequelize";
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
  sortBy = "createdAt", // default sorting field
  sortOrder = "DESC",   // ASC or DESC
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

  // Build order array dynamically
  let order = [["createdAt", "DESC"]]; // default
  if (sortBy === "applicationsCount") {
    order = [[Sequelize.literal('"applicationsCount"'), sortOrder]];
  } else {
    order = [[sortBy, sortOrder]];
  }

  const { count, rows } = await Job.findAndCountAll({
    where,
    include: [
      {
        model: JobApplication,
        as: "applications",
        required: false,
        attributes: [],
      },
    ],
    attributes: {
      include: [
        [Sequelize.fn("COUNT", Sequelize.col("applications.id")), "applicationsCount"],
      ],
    },
    group: ["Job.id"],
    distinct: true,
    order,
    limit: parseInt(limit),
    offset: parseInt(offset),
    subQuery: false,
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
    where: { jobId: jobId, isDeleted: false },
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
  const todayStart = moment().startOf("day").toDate();
  const todayEnd = moment().endOf("day").toDate();

  const monthStart = moment().startOf("month").toDate();
  const monthEnd = moment().endOf("month").toDate();

  const weekRanges = [
    [monthStart, moment(monthStart).add(6, "days").endOf("day").toDate()],
    [moment(monthStart).add(7, "days").startOf("day").toDate(), moment(monthStart).add(13, "days").endOf("day").toDate()],
    [moment(monthStart).add(14, "days").startOf("day").toDate(), moment(monthStart).add(20, "days").endOf("day").toDate()],
    [moment(monthStart).add(21, "days").startOf("day").toDate(), monthEnd],
  ];

  const stats = await Job.findAll({
    attributes: [
      [Sequelize.fn("COUNT", Sequelize.col("Job.id")), "totalJobs"],
      [Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN "Job"."jobStatus" = 'open' THEN 1 ELSE 0 END`)), "openJobs"],
      [Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN "Job"."jobStatus" = 'closed' THEN 1 ELSE 0 END`)), "closedJobs"],
      [Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN "Job"."jobType" = 'full-time' THEN 1 ELSE 0 END`)), "fullTimeJobs"],
      [Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN "Job"."jobType" = 'part-time' THEN 1 ELSE 0 END`)), "partTimeJobs"],
      [Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN "Job"."jobType" = 'contract' THEN 1 ELSE 0 END`)), "contractJobs"],
      [Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN "Job"."jobType" = 'remote' THEN 1 ELSE 0 END`)), "remoteJobs"],
      [Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN "Job"."jobType" = 'internship' THEN 1 ELSE 0 END`)), "internshipJobs"],
      [Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN "Job"."createdAt" BETWEEN '${todayStart.toISOString()}' AND '${todayEnd.toISOString()}' THEN 1 ELSE 0 END`)), "todayJobs"],
      [Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN "Job"."createdAt" BETWEEN '${weekRanges[0][0].toISOString()}' AND '${weekRanges[0][1].toISOString()}' THEN 1 ELSE 0 END`)), "weekOneJobs"],
      [Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN "Job"."createdAt" BETWEEN '${weekRanges[1][0].toISOString()}' AND '${weekRanges[1][1].toISOString()}' THEN 1 ELSE 0 END`)), "weekTwoJobs"],
      [Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN "Job"."createdAt" BETWEEN '${weekRanges[2][0].toISOString()}' AND '${weekRanges[2][1].toISOString()}' THEN 1 ELSE 0 END`)), "weekThreeJobs"],
      [Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN "Job"."createdAt" BETWEEN '${weekRanges[3][0].toISOString()}' AND '${weekRanges[3][1].toISOString()}' THEN 1 ELSE 0 END`)), "weekFourJobs"],
      [Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN "Job"."createdAt" BETWEEN '${monthStart.toISOString()}' AND '${monthEnd.toISOString()}' THEN 1 ELSE 0 END`)), "thisMonthJobs"],
    ],
    where: { isDeleted: false },
    raw: true,
  });

  const result = stats[0] || {};

  // Convert all values to integers
  const numericResult = {};
  for (const key in result) {
    numericResult[key] = Number(result[key]) || 0;
  }

  return numericResult;
};


