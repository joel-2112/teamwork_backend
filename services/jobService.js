const { Op } = require('sequelize');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');

class JobService {
  async createJobService(data) {
    return await Job.create(data);
  }

  async getAllJobsService({ page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const { count, rows } = await Job.findAndCountAll({
      include: [{ model: JobApplication, as: 'JobApplications' }],
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
  }

  async getJobByIdService(id) {
    const job = await Job.findByPk(id, {
      include: [{ model: JobApplication, as: 'JobApplications' }],
    });
    if (!job) throw new Error('Job not found');
    return job;
  }

  async updateJobService(id, data) {
    const job = await Job.findByPk(id);
    if (!job) throw new Error('Job not found');
    return await job.update(data);
  }

  async deleteJobService(id) {
    const job = await Job.findByPk(id);
    if (!job) throw new Error('Job not found');
    const applicationCount = await JobApplication.count({ where: { jobId: id } });
    if (applicationCount > 0) throw new Error('Cannot delete job with associated applications');
    return await job.destroy();
  }

  async getOpenJobsService({ page = 1, limit = 10, category, location, jobType, search } = {}) {
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
      include: [{ model: JobApplication, as: 'JobApplications' }],
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
  }
}

module.exports = new JobService();