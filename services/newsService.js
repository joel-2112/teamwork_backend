const {News} = require('../models');
class NewsService {
  async createNews(data) {
    return await News.create(data);
  }

  async getAllNews() {
    return await News.findAll({
      order: [['publishDate', 'DESC']],
    });
  }

  async getNewsById(id) {
    const news = await News.findByPk(id);
    if (!news) throw new Error('News not found');
    return news;
  }

  async updateNews(id, data) {
    const news = await News.findByPk(id);
    if (!news) throw new Error('News not found');
    return await news.update(data);
  }

  async deleteNews(id) {
    const news = await News.findByPk(id);
    if (!news) throw new Error('News not found');
    return await news.destroy();
  }
}

module.exports = new NewsService();