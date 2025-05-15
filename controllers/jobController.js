const jobService = require('../services/jobService');
const { validationResult } = require('express-validator');

const getAllJobs = async (req, res) => {
    try {
        console.log('Handling getAllJobs request');
        const jobs = await jobService.getAllOpenJobsService({ include: ['JobApplications'] });
        return res.status(200).json({
            success: true,
            data: jobs,
        });
    } catch (error) {
        console.error('Error in getAllJobs:', error.message, error.stack);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server Error',
        });
    }
};

const getJobById = async (req, res) => {
    try {
        console.log('Handling getJobById request for ID:', req.params.id);
        const job = await jobService.getJobByIdService(req.params.id, { include: ['JobApplications'] });
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }
        return res.status(200).json({
            success: true,
            data: job,
        });
    } catch (error) {
        console.error('Error in getJobById:', error.message, error.stack);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server Error',
        });
    }
};

const createJob = async (req, res) => {
    try {
        console.log('Handling createJob request with body:', req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        const job = await jobService.createJobService(req.body);
        return res.status(201).json({
            success: true,
            data: job,
        });
    } catch (error) {
        console.error('Error in createJob:', error.message, error.stack);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server Error',
        });
    }
};

const updateJob = async (req, res) => {
    try {
        console.log('Handling updateJob request for ID:', req.params.id);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        const job = await jobService.updateJobService(req.params.id, req.body);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }
        return res.status(200).json({
            success: true,
            data: job,
        });
    } catch (error) {
        console.error('Error in updateJob:', error.message, error.stack);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server Error',
        });
    }
};

const deleteJob = async (req, res) => {
    try {
        console.log('Handling deleteJob request for ID:', req.params.id);
        const deleted = await jobService.deleteJobService(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Job deleted',
        });
    } catch (error) {
        console.error('Error in deleteJob:', error.message, error.stack);
        return res.status(error.status || 500).json({
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