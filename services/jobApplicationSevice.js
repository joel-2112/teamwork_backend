const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');
const submitApplication = async (applicationData) => {
  try {
    const { jobId, resume } = applicationData;
    if (!resume) {
      const err = new Error('Resume is required');
      err.status = 400;
      throw err;
    }
    const job = await Job.findByPk(jobId);
    if (!job || job.jobStatus !== 'open') {
      const err = new Error('Invalid or closed job');
      err.status = 400;
      throw err;
    }
    return await JobApplication.create(applicationData);
  } catch (error) {
    const err = error.status ? error : new Error('Failed to submit application');
    err.status = err.status || 500;
    throw err;
  }
};

const getAllApplications = async () => {
  try {
    return await JobApplication.findAll({
      include: [{ model: Job, as: 'job', attributes: ['title'] }],
      order: [['createdAt', 'DESC']],
    });
  } catch (error) {
    const err = new Error('Failed to fetch applications');
    err.status = 500;
    throw err;
  }
};

const getApplicationById = async (id) => {
  try {
    const application = await JobApplication.findByPk(id, {
      include: [{ model: Job, as: 'job', attributes: ['title'] }],
    });
    if (!application) {
      const err = new Error('Application not found');
      err.status = 404;
      throw err;
    }
    return application;
  } catch (error) {
    const err = error.status ? error : new Error('Failed to fetch application');
    err.status = err.status || 500;
    throw err;
  }
};

const updateApplicationStatus = async (id, status) => {
  try {
    const validStatuses = ['Pending', 'Submitted', 'Reviewed', 'Accepted', 'Rejected'];
    if (!validStatuses.includes(status)) {
      const err = new Error('Invalid status');
      err.status = 400;
      throw err;
    }
    const application = await JobApplication.findByPk(id);
    if (!application) {
      const err = new Error('Application not found');
      err.status = 404;
      throw err;
    }
    application.submissionStatus = status;
    return await application.save();
  } catch (error) {
    const err = error.status ? error : new Error('Failed to update application status');
    err.status = err.status || 500;
    throw err;
  }
};

module.exports = {
  submitApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
};