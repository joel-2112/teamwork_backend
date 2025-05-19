const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');

class JobApplicationService {
  async createJobApplication(data) {
    const { jobId } = data;
    const job = await Job.findByPk(jobId);
    if (!job) throw new Error('Invalid Job');
    if (job.jobStatus === 'closed') throw new Error('Job is closed');
    if (job.deadline < new Date()) throw new Error('Application deadline has passed');
    return await JobApplication.create(data);
  }

  async getAllJobApplications() {
    return await JobApplication.findAll({
      include: [Job],
      order: [['createdAt', 'DESC']],
    });
  }

  async getJobApplicationById(id) {
    const application = await JobApplication.findByPk(id, {
      include: [Job],
    });
    if (!application) throw new Error('Job Application not found');
    return application;
  }

  async updateJobApplication(id, data) {
    const application = await JobApplication.findByPk(id);
    if (!application) throw new Error('Job Application not found');
    if (data.jobId) {
      const job = await Job.findByPk(data.jobId);
      if (!job) throw new Error('Invalid Job');
      if (job.jobStatus === 'closed') throw new Error('Job is closed');
      if (job.deadline < new Date()) throw new Error('Application deadline has passed');
    }
    return await application.update(data);
  }

  async deleteJobApplication(id) {
    const application = await JobApplication.findByPk(id);
    if (!application) throw new Error('Job Application not found');
    return await application.destroy();
  }
}

module.exports = new JobApplicationService();