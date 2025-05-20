const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');

class JobService {
  async createJob(data) {
    return await Job.create(data);
  }

  async getAllJobs() {
    return await Job.findAll({
      include: [{ model: JobApplication, as: 'JobApplications' }],
      order: [['createdAt', 'DESC']],
    });
  }

  async getJobById(id) {
    const job = await Job.findByPk(id, {
      include: [{ model: JobApplication, as: 'JobApplications' }],
    });
    if (!job) throw new Error('Job not found');
    return job;
  }

  async updateJob(id, data) {
    const job = await Job.findByPk(id);
    if (!job) throw new Error('Job not found');
    return await job.update(data);
  }

  async deleteJob(id) {
    const job = await Job.findByPk(id);
    if (!job) throw new Error('Job not found');
    const applicationCount = await JobApplication.count({ where: { jobId: id } });
    if (applicationCount > 0) throw new Error('Job has associated applications');
    return await job.destroy();
  }
  async getOpenJobs({ page = 1, limit = 10, category, location, jobType } = {}) {
  const offset = (page - 1) * limit;
  const where = { jobStatus: 'open' };
  if (category) where.category = category;
  if (location) where.location = { [Sequelize.Op.like]: `%${location}%` };
  if (jobType) where.jobType = jobType;

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