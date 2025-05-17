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
      const agents = await AgentService.getAllAgents();
      res.status(200).json(agents);
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

  async getRegionHierarchy(req, res) {
    try {
      const hierarchy = await AgentService.getRegionHierarchy();
      res.status(200).json(hierarchy);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getZonesByRegion(req, res) {
    try {
      const zones = await AgentService.getZonesByRegion(req.params.regionId);
      res.status(200).json(zones);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getWoredasByZone(req, res) {
    try {
      const woredas = await AgentService.getWoredasByZone(req.params.zoneId);
      res.status(200).json(woredas);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AgentController();