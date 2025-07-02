import db from "../models/index.js";
import fs from "fs";
import path from "path";
const { News } = db;

// service to create news
export const createNews = async (data, checkOnly = false) => {
  const existingNews = await News.findOne({
    where: {
      title: data.title,
      content: data.content,
    },
  });

  if (existingNews) {
    throw new Error("News with the same title and content already exists");
  }

  if (checkOnly) return null;

  return await News.create(data);
};

// Service to get all news
export const getAllNews = async () => {
  return await News.findAll({
    order: [["publishDate", "DESC"]],
  });
};

export const getNewsById = async (id) => {
  const news = await News.findByPk(id);
  if (!news) throw new Error("News not found");
  return news;
};

// Service to update news by id
export const updateNews = async (id, data) => {
  const news = await News.findByPk(id);
  if (!news) throw new Error("News not found");
  return await news.update(data);
};

// Service to delete news by id
export const deleteNews = async (id) => {
  const news = await News.findByPk(id);
  if (!news) throw new Error("News not found");

  // Delete associated image if it exists
  if (news.imageUrl) {
    const imagePath = path.join(
      process.cwd(),
      "uploads/assets",
      path.basename(news.imageUrl)
    );
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
