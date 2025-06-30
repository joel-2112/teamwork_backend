import { Op } from 'sequelize';
import db from '../models/index.js'; // ensure index.js uses ESM exports
const { Job, JobApplication } = db;

export const createJobService = async (data) => {
  return await Job.create(data);
};

export const getAllJobsService = async ({ page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await Job.findAndCountAll({
    include: [{
      model: JobApplication,
      as: 'JobApplications',
      required: false,
      attributes: ['id', 'applicantFullName', 'applicantEmail', 'status', 'createdAt'],
    }],
    order: [['createdAt', 'DESC']],
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

export const getJobByIdService = async (id) => {
  const job = await Job.findByPk(id, {
    include: [{
      model: JobApplication,
      as: 'JobApplications',
      required: false,
      attributes: ['id', 'applicantFullName', 'applicantEmail', 'status', 'createdAt'],
    }],
  });
  if (!job) throw new Error('Job not found');
  return job;
};

export const updateJobService = async (id, data) => {
  const job = await Job.findByPk(id);
  if (!job) throw new Error('Job not found');
  return await job.update(data);
};

export const deleteJobService = async (id) => {
  const job = await Job.findByPk(id);
  if (!job) throw new Error('Job not found');
  const applicationCount = await JobApplication.count({ where: { jobId: id } });
  if (applicationCount > 0) throw new Error('Cannot delete job with associated applications');
  return await job.destroy();
};

export const getOpenJobsService = async ({
  page = 1,
  limit = 10,
  category,
  location,
  jobType,
  search
} = {}) => {
  const offset = (page - 1) * limit;
  const where = { jobStatus: 'open' };

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
    include: [{
      model: JobApplication,
      as: 'JobApplications',
      required: false,
      attributes: ['id', 'applicantFullName', 'applicantEmail', 'status', 'createdAt'],
    }],
    order: [['createdAt', 'DESC']],
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
