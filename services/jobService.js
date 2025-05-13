const { Job, User } = require('../models');

const getAllOpenJobs = async () => {
  try {
    const jobs = await Job.findAll({
      where: { jobStatus: 'open' },
      attributes: ['id', 'title', 'description', 'deadline', 'location', 'salary', 'jobType'],
    });
    return jobs;
  } catch (error) {
    const err = new Error('Failed to fetch jobs');
    err.status = 500;
    throw err;
  }
};

const getJobById = async (id) => {
  try {
    const job = await Job.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['username'] }],
    });
    if (!job) {
      const err = new Error('Job not found');
      err.status = 404;
      throw err;
    }
    return job;
  } catch (error) {
    const err = error.status ? error : new Error('Failed to fetch job');
    err.status = err.status || 500;
    throw err;
  }
};

const createJob = async (jobData) => {
  try {
    const { userId } = jobData;
    const user = await User.findByPk(userId);
    if (!user || user.role !== 'Admin') {
      const err = new Error('Only admins can create jobs');
      err.status = 403;
      throw err;
    }
    return await Job.create(jobData);
  } catch (error) {
    const err = error.status ? error : new Error('Failed to create job');
    err.status = err.status || 500;
    throw err;
  }
};

const updateJob = async (id, updates, userId) => {
  try {
    const job = await Job.findByPk(id);
    if (!job) {
      const err = new Error('Job not found');
      err.status = 404;
      throw err;
    }
    if (job.userId !== userId) {
      const err = new Error('Unauthorized to update this job');
      err.status = 403;
      throw err;
    }
    return await job.update(updates);
  } catch (error) {
    const err = error.status ? error : new Error('Failed to update job');
    err.status = err.status || 500;
    throw err;
  }
};

const deleteJob = async (id, userId) => {
  try {
    const job = await Job.findByPk(id);
    if (!job) {
      const err = new Error('Job not found');
      err.status = 404;
      throw err;
    }
    if (job.userId !== userId) {
      const err = new Error('Unauthorized to delete this job');
      err.status = 403;
      throw err;
    }
    await job.destroy();
  } catch (error) {
    const err = error.status ? error : new Error('Failed to delete job');
    err.status = err.status || 500;
    throw err;
  }
};

module.exports = {
  getAllOpenJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};