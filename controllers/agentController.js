const AgentService = require('../services/agentService');

class AgentController {
  async createAgent(req, res) {
    try {
      const agent = await AgentService.createAgent(req.body);
      res.status(201).json(agent);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllAgents(req, res) {
    try {
      const { page = 1, limit = 10, search, agentType, sex } = req.query;
      const filters = { search, agentType, sex };
      const result = await AgentService.getAllAgents(parseInt(page), parseInt(limit), filters);
      res.status(200).json({
        data: result.rows,
        total: result.count,
        page: parseInt(page),
        totalPages: Math.ceil(result.count / limit)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAgentById(req, res) {
    try {
      const agent = await AgentService.getAgentById(req.params.id);
      res.status(200).json(agent);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateAgent(req, res) {
    try {
      const agent = await AgentService.updateAgent(req.params.id, req.body);
      res.status(200).json(agent);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteAgent(req, res) {
    try {
      await AgentService.deleteAgent(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AgentController();