const RegionService = require('../services/regionService');

class RegionController {
  async createRegion(req, res) {
    try {
      const region = await RegionService.createRegion(req.body);
      res.status(201).json(region);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllRegions(req, res) {
    try {
      const regions = await RegionService.getAllRegions();
      res.status(200).json(regions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getRegionById(req, res) {
    try {
      const region = await RegionService.getRegionById(req.params.id);
      res.status(200).json(region);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateRegion(req, res) {
    try {
      const region = await RegionService.updateRegion(req.params.id, req.body);
      res.status(200).json(region);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteRegion(req, res) {
    try {
      await RegionService.deleteRegion(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new RegionController();