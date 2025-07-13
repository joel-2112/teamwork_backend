import {
  createAgentService,
  getAllAgentsService,
  getAgentByIdService,
  updateAgentService,
  deleteAgentService,
} from "../services/agentService.js";

export const createAgent = async (req, res) => {
  try {
    const agent = await createAgentService(req.body);
    res
      .status(201)
      .json({ success: true, message: "Agent created successfully.", agent });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllAgents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, agentType, sex } = req.query;
    const filters = { search, agentType, sex };
    const result = await getAllAgentsService(
      parseInt(page),
      parseInt(limit),
      filters
    );
    res.status(200).json({
      data: result.rows,
      total: result.count,
      page: parseInt(page),
      totalPages: Math.ceil(result.count / limit),
    });
  } catch (error) {
    console.error("Controller error in getAllAgents:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAgentById = async (req, res) => {
  try {
    const agent = await getAgentByIdService(req.params.id);
    res.status(200).json(agent);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const updateAgent = async (req, res) => {
  try {
    const agent = await updateAgentService(req.params.id, req.body);
    res.status(200).json(agent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAgent = async (req, res) => {
  try {
    await deleteAgentService(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
