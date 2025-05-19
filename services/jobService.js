const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');

class JobService {
  async createJob(data) {
    return await Job.create(data);
  }

  async getAllJobs() {
    return await Job.findAll({
      include: [JobApplication],
      order: [['createdAt', 'DESC']],
    });
  }

  async getJobById(id) {
    const job = await Job.findByPk(id, {
      include: [JobApplication],
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
}

module.exports = new JobService();