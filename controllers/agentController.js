const agentService = require('../services/agentService');
const { validationResult } = require('express-validator');

const getAllAgents = async (req, res) => {
    try {
        console.log('Handling getAllAgents request');
        const agents = await agentService.getAllAgentsService();
        return res.status(200).json({
            success: true,
            data: agents,
        });
    } catch (error) {
        console.error('Error in getAllAgents:', error.message, error.stack);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server Error',
        });
    }
};

const getAgentById = async (req, res) => {
    try {
        console.log('Handling getAgentById request for ID:', req.params.id);
        const agent = await agentService.getAgentByIdService(req.params.id);
        return res.status(200).json({
            success: true,
            data: agent,
        });
    } catch (error) {
        console.error('Error in getAgentById:', error.message, error.stack);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server Error',
        });
    }
};

const createAgent = async (req, res) => {
    try {
        console.log('Handling createAgent request with body:', req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        const agent = await agentService.createAgentService(req.body);
        return res.status(201).json({
            success: true,
            data: agent,
        });
    } catch (error) {
        console.error('Error in createAgent:', error.message, error.stack);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server Error',
        });
    }
};

const updateAgent = async (req, res) => {
    try {
        console.log('Handling updateAgent request for ID:', req.params.id);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }
        const agent = await agentService.updateAgentService(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            data: agent,
        });
    } catch (error) {
        console.error('Error in updateAgent:', error.message, error.stack);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server Error',
        });
    }
};

const deleteAgent = async (req, res) => {
    try {
        console.log('Handling deleteAgent request for ID:', req.params.id);
        const deleted = await agentService.deleteAgentService(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Agent deleted',
        });
    } catch (error) {
        console.error('Error in deleteAgent:', error.message, error.stack);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server Error',
        });
    }
};

module.exports = {
    getAllAgents,
    getAgentById,
    createAgent,
    updateAgent,
    deleteAgent,
};