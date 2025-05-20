const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');

class JobApplicationService {
  async createJobApplicationService(data) {
    const job = await Job.findByPk(data.jobId);
    if (!job) throw new Error('Job not found');
    if (job.jobStatus !== 'open') throw new Error('Job is closed');
    const requiredFields = ['applicantFullName', 'applicantEmail', 'jobId', 'resume'];
    for (const field of requiredFields) {
      if (!data[field]) throw new Error(`Missing required field: ${field}`);
    }
    return await JobApplication.create(data);
  }

  async getApplicationsByJobIdService(jobId, { page = 1, limit = 10, status } = {}) {
    const job = await Job.findByPk(jobId);
    if (!job) throw new Error('Job not found');
    const offset = (page - 1) * limit;
    const where = { jobId };
    if (status) where.status = status;

    const { count, rows } = await JobApplication.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      applications: rows,
    };
  }

  async getApplicationByIdService(id) {
    const application = await JobApplication.findByPk(id, {
      include: [{ model: Job, as: 'Job' }],
    });
    if (!application) throw new Error('Job application not found');
    return application;
  }

  async updateApplicationStatusService(id, status) {
    const application = await JobApplication.findByPk(id);
    if (!application) throw new Error('Job application not found');
    return await application.update({ status });
  }

  async deleteApplicationService(id) {
    const application = await JobApplication.findByPk(id);
    if (!application) throw new Error('Job application not found');
    return await application.destroy();
  }
}

module.exports = new JobApplicationService();