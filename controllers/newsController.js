const NewsService = require('../services/NewsService');

class NewsController {
  async createNews(req, res) {
    try {
      const news = await NewsService.createNews(req.body);
      res.status(201).json(news);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllNews(req, res) {
    try {
      const news = await NewsService.getAllNews();
      res.status(200).json(news);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getNewsById(req, res) {
    try {
      const news = await NewsService.getNewsById(req.params.id);
      res.status(200).json(news);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateNews(req, res) {
    try {
      const news = await NewsService.updateNews(req.params.id, req.body);
      res.status(200).json(news);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteNews(req, res) {
    try {
      await NewsService.deleteNews(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new NewsController();