import db from '../models/index.js';

const { News } = db

export const createNews = async (data) => {
  return await News.create(data);
};

export const getAllNews = async () => {
  return await News.findAll({
    order: [['publishDate', 'DESC']],
  });
};

export const getNewsById = async (id) => {
  const news = await News.findByPk(id);
  if (!news) throw new Error('News not found');
  return news;
};

export const updateNews = async (id, data) => {
  const news = await News.findByPk(id);
  if (!news) throw new Error('News not found');
  return await news.update(data);
};

export const deleteNews = async (id) => {
  const news = await News.findByPk(id);
  if (!news) throw new Error('News not found');
  return await news.destroy();
};
