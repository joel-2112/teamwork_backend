const { Agent } = require('../models');

const getAllAgentsService = async () => {
    try {
        console.log('Fetching all agents');
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
        console.log('Fetching agent with ID:', id);
        const agent = await Agent.findByPk(id, {
            attributes: ['id', 'name', 'email', 'phone'],
        });
        if (!agent) {
            console.log('Agent not found for ID:', id);
            const err = new Error('Agent not found');
            err.status = 404;
            throw err;
        }
        console.log('Fetched agent:', agent.toJSON());
        return agent;
    } catch (error) {
        console.error('Error in getAgentByIdService:', error.message, error.stack);
        const err = error.status ? error : new Error(`Failed to fetch agent: ${error.message}`);
        err.status = err.status || 500;
        throw err;
    }
};

const createAgentService = async (agentData) => {
    try {
        console.log('Creating agent with data:', agentData);
        const agent = await Agent.create(agentData);
        if (!agent) {
            console.error('Agent creation failed: No agent returned');
            const error = new Error('Agent creation failed: No agent returned');
            error.status = 500;
            throw error;
        }
        console.log('Agent created successfully:', agent.toJSON());
        return agent;
    } catch (error) {
        console.error('Error in createAgentService:', error.message, error.stack);
        const err = new Error(`Failed to create agent: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const updateAgentService = async (id, updates) => {
    try {
        console.log('Updating agent ID:', id, 'with data:', updates);
        const agent = await Agent.findByPk(id);
        if (!agent) {
            console.log('Agent not found for ID:', id);
            const err = new Error('Agent not found');
            err.status = 404;
            throw err;
        }
        const updatedAgent = await agent.update(updates);
        console.log('Agent updated successfully:', updatedAgent.toJSON());
        return updatedAgent;
    } catch (error) {
        console.error('Error in updateAgentService:', error.message, error.stack);
        const err = error.status ? error : new Error(`Failed to update agent: ${error.message}`);
        err.status = err.status || 500;
        throw err;
    }
};

const deleteAgentService = async (id) => {
    try {
        console.log('Deleting agent ID:', id);
        const agent = await Agent.findByPk(id);
        if (!agent) {
            console.log('Agent not found for ID:', id);
            const err = new Error('Agent not found');
            err.status = 404;
            throw err;
        }
        await agent.destroy();
        console.log('Agent deleted successfully:', id);
        return true;
    } catch (error) {
        console.error('Error in deleteAgentService:', error.message, error.stack);
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