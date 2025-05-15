const { Job, JobApplication } = require('../models');

const getAllOpenJobsService = async (options = {}) => {
    try {
        console.log('Fetching open jobs with options:', options);
        const jobs = await Job.findAll({
            where: { jobStatus: 'open' },
            attributes: [
                'id', 'title', 'companyName', 'description', 'deadline',
                'location', 'salary', 'jobType', 'category', 'benefits', 'experience'
            ],
            include: options.include ? [{
                model: JobApplication,
                as: 'JobApplications',
                attributes: ['id', 'status', 'applicantFullName', 'appliedAt']
            }] : [],
        });
        console.log('Fetched jobs:', jobs.length);
        return jobs;
    } catch (error) {
        console.error('Error in getAllOpenJobsService:', error.message, error.stack);
        const err = new Error(`Failed to fetch jobs: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const getJobByIdService = async (id, options = {}) => {
    try {
        console.log('Fetching job with ID:', id);
        const job = await Job.findByPk(id, {
            attributes: [
                'id', 'title', 'companyName', 'description', 'deadline',
                'location', 'salary', 'jobType', 'category', 'benefits',
                'requirements', 'skills', 'experience', 'jobStatus'
            ],
            include: options.include ? [{
                model: JobApplication,
                as: 'JobApplications',
                attributes: ['id', 'status', 'applicantFullName', 'appliedAt']
            }] : [],
        });
        if (!job) {
            console.log('Job not found for ID:', id);
            const err = new Error('Job not found');
            err.status = 404;
            throw err;
        }
        console.log('Fetched job:', job.toJSON());
        return job;
    } catch (error) {
        console.error('Error in getJobByIdService:', error.message, error.stack);
        const err = error.status ? error : new Error(`Failed to fetch job: ${error.message}`);
        err.status = err.status || 500;
        throw err;
    }
};

const createJobService = async (jobData) => {
    try {
        console.log('Creating job with data:', jobData);
        const job = await Job.create(jobData);
        if (!job || !job.id) {
            console.error('Job creation failed: No job returned');
            throw new Error('Job creation failed: No job returned');
        }
        console.log('Job created successfully:', job.toJSON());
        return job;
    } catch (error) {
        console.error('Error in createJobService:', error.message, error.stack);
        const err = new Error(`Failed to create job: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const updateJobService = async (id, updates) => {
    try {
        console.log('Updating job ID:', id, 'with data:', updates);
        const job = await Job.findByPk(id);
        if (!job) {
            console.log('Job not found for ID:', id);
            const err = new Error('Job not found');
            err.status = 404;
            throw err;
        }
        const updatedJob = await job.update(updates);
        console.log('Job updated successfully:', updatedJob.toJSON());
        return updatedJob;
    } catch (error) {
        console.error('Error in updateJobService:', error.message, error.stack);
        const err = error.status ? error : new Error(`Failed to update job: ${error.message}`);
        err.status = err.status || 500;
        throw err;
    }
};

const deleteJobService = async (id) => {
    try {
        console.log('Deleting job ID:', id);
        const job = await Job.findByPk(id);
        if (!job) {
            console.log('Job not found for ID:', id);
            const err = new Error('Job not found');
            err.status = 404;
            throw err;
        }
        await job.destroy();
        console.log('Job deleted successfully:', id);
        return true;
    } catch (error) {
        console.error('Error in deleteJobService:', error.message, error.stack);
        const err = error.status ? error : new Error(`Failed to delete job: ${error.message}`);
        err.status = err.status || 500;
        throw err;
    }
};

module.exports = {
    getAllOpenJobsService,
    getJobByIdService,
    createJobService,
    updateJobService,
    deleteJobService,
};