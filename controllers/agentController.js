import {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
} from '../services/agentService.js';

export const createAgentController = async (req, res) => {
  try {
    const agent = await createAgent(req.body);
    res.status(201).json(agent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllAgentsController = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, agentType, sex } = req.query;
    const filters = { search, agentType, sex };
    const result = await getAllAgents(parseInt(page), parseInt(limit), filters);
    res.status(200).json({
      data: result.rows,
      total: result.count,
      page: parseInt(page),
      totalPages: Math.ceil(result.count / limit),
    });
  } catch (error) {
    console.error('Controller error in getAllAgents:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAgentByIdController = async (req, res) => {
  try {
    const agent = await getAgentById(req.params.id);
    res.status(200).json(agent);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const updateAgentController = async (req, res) => {
  try {
    const agent = await updateAgent(req.params.id, req.body);
    res.status(200).json(agent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAgentController = async (req, res) => {
  try {
    await deleteAgent(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
