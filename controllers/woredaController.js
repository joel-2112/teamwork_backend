const WoredaService = require('../services/woredaService');

class WoredaController {
  async createWoreda(req, res) {
    try {
      const woreda = await WoredaService.createWoreda(req.body);
      res.status(201).json(woreda);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllWoredas(req, res) {
    try {
      const woredas = await WoredaService.getAllWoredas();
      res.status(200).json(woredas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getWoredaById(req, res) {
    try {
      const woreda = await WoredaService.getWoredaById(req.params.id);
      res.status(200).json(woreda);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateWoreda(req, res) {
    try {
      const woreda = await WoredaService.updateWoreda(req.params.id, req.body);
      res.status(200).json(woreda);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteWoreda(req, res) {
    try {
      await WoredaService.deleteWoreda(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new WoredaController();