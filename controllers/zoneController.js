const ZoneService = require('../services/zoneService');

class ZoneController {
  async createZone(req, res) {
    try {
      const zone = await ZoneService.createZone(req.body);
      res.status(201).json(zone);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllZones(req, res) {
    try {
      const zones = await ZoneService.getAllZones();
      res.status(200).json(zones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getZoneById(req, res) {
    try {
      const zone = await ZoneService.getZoneById(req.params.id);
      res.status(200).json(zone);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateZone(req, res) {
    try {
      const zone = await ZoneService.updateZone(req.params.id, req.body);
      res.status(200).json(zone);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteZone(req, res) {
    try {
      await ZoneService.deleteZone(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ZoneController();