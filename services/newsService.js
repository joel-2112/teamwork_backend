import db from '../models/index.js';
import fs from "fs";
import path from "path";

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
  if (!news) throw new Error("News not found");

  // Delete associated image if it exists
  if (news.imageUrl) {
    const imagePath = path.join(process.cwd(), "uploads/assets", path.basename(news.imageUrl));
    try {
      await fs.promises.unlink(imagePath);
      console.log(`Deleted image file: ${imagePath}`);
    } catch (err) {
      console.error(`Error deleting image file: ${err.message}`);
    }
  }

  // Delete the news record from DB
  return await news.destroy();
};

