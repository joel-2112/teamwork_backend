const jobService = require('../services/jobService');

const getAllJobs = async (req, res) => {
    try {
        const jobs = await jobService.getAllOpenJobs({ include: ['JobApplications'] });
        res.status(200).json({
            success: true,
            data: jobs,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server Error',
        });
    }
};

const getJobById = async (req, res) => {
    try {
        const job = await jobService.getJobById(req.params.id, { include: ['JobApplications'] });
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }
        res.status(200).json({
            success: true,
            data: job,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server Error',
        });
    }
};

const createJob = async (req, res) => {
    try {
        const job = await jobService.createJob(req.body);
        res.status(201).json({
            success: true,
            data: job,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server Error',
        });
    }
};

const updateJob = async (req, res) => {
    try {
        const job = await jobService.updateJob(req.params.id, req.body);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }
        res.status(200).json({
            success: true,
            data: job,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server Error',
        });
    }
};

const deleteJob = async (req, res) => {
    try {
        const deleted = await jobService.deleteJob(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }
        res.status(200).json({
            success: true,
            message: 'Job deleted',
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server Error',
        });
    }
};

module.exports = {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
};