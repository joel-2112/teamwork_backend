const Agent = require('../models/Agent');
const getAllAgentsService = async () => {
    try {
        const agents = await Agent.findAll({
            attributes: ['id', 'name', 'email', 'phone'],
        });
        console.log('Fetched agents:', agents.length);
        return agents;
    } catch (error) {
        console.error('Error in getAllAgentsService:', error.message, error.stack);
        const err = new Error(`Failed to fetch agents: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const getAgentByIdService = async (id) => {
    try {
        const agent = await Agent.findByPk(id, {
            attributes: ['id', 'name', 'email', 'phone'],
        });
        if (!agent) {
            const err = new Error('Agent not found');
            err.status = 404;
            throw err;
        }
        return agent;
    } catch (error) {
        const err = error.status ? error : new Error(`Failed to fetch agent: ${error.message}`);
        err.status = err.status || 500;
        throw err;
    }
};

const createAgentService = async (agentData) => {
    try {
        const agent = await Agent.create(agentData);
        if (!agent) {
            const error = new Error('Agent creation failed: No agent returned');
            error.status = 500;
            throw error;
        }
        return agent;
    } catch (error) {
        const err = new Error(`Failed to create agent: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const updateAgentService = async (id, updates) => {
    try {
        const agent = await Agent.findByPk(id);
        if (!agent) {
            const err = new Error('Agent not found');
            err.status = 404;
            throw err;
        }
        const updatedAgent = await agent.update(updates);
        return updatedAgent;
    } catch (error) {
        const err = error.status ? error : new Error(`Failed to update agent: ${error.message}`);
        err.status = err.status || 500;
        throw err;
    }
};

const deleteAgentService = async (id) => {
    try {
        const agent = await Agent.findByPk(id);
        if (!agent) {
            const err = new Error('Agent not found');
            err.status = 404;
            throw err;
        }
        await agent.destroy();
        return true;
    } catch (error) {
        const err = error.status ? error : new Error(`Failed to delete agent: ${error.message}`);
        err.status = err.status || 500;
        throw err;
    }
};

module.exports = {
    getAllAgentsService,
    getAgentByIdService,
    createAgentService,
    updateAgentService,
    deleteAgentService,
};