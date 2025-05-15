const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');

const getAllOpenJobs = async (options = {}) => {
    try {
        const jobs = await Job.findAll({
            where: { jobStatus: 'open' },
            attributes: [
                'id', 'title', 'companyName', 'description', 'deadline',
                'location', 'salary', 'jobType', 'category', 'benefits', 'experience'
            ],
            include: options.include ? [{ model: JobApplication, as: 'JobApplications', attributes: ['id', 'status', 'applicantFullName', 'appliedAt'] }] : [],
        });
        return jobs;
    } catch (error) {
        const err = new Error('Failed to fetch jobs');
        err.status = 500;
        throw err;
    }
};

const getJobById = async (id, options = {}) => {
    try {
        const job = await Job.findByPk(id, {
            attributes: [
                'id', 'title', 'companyName', 'description', 'deadline',
                'location', 'salary', 'jobType', 'category', 'benefits',
                'requirements', 'skills', 'experience', 'jobStatus'
            ],
            include: options.include ? [{ model: JobApplication, as: 'JobApplications', attributes: ['id', 'status', 'applicantFullName', 'appliedAt'] }] : [],
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
        return await Job.create(jobData);
    } catch (error) {
        const err = error.status ? error : new Error('Failed to create job');
        err.status = err.status || 500;
        throw err;
    }
};

const updateJob = async (id, updates) => {
    try {
        const job = await Job.findByPk(id);
        if (!job) {
            const err = new Error('Job not found');
            err.status = 404;
            throw err;
        }
        return await job.update(updates);
    } catch (error) {
        const err = error.status ? error : new Error('Failed to update job');
        err.status = err.status || 500;
        throw err;
    }
};

const deleteJob = async (id) => {
    try {
        const job = await Job.findByPk(id);
        if (!job) {
            const err = new Error('Job not found');
            err.status = 404;
            throw err;
        }
        await job.destroy();
        return true;
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