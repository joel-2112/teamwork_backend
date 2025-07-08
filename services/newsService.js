import db from "../models/index.js";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";
import { title } from "process";
import moment from "moment";
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
export const getAllNews = async ({
  page = 1,
  limit = 10,
  title,
  search,
} = {}) => {
  const offset = (page - 1) * limit;
  const where = {};

  if (title) where.title = title;

  if (search) {
    where[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }];
  }

  const { count, rows } = await News.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  // Time ranges
  const todayStart = moment().startOf("day").toDate();
  const weekStart = moment().startOf("isoWeek").toDate(); // Monday
  const monthStart = moment().startOf("month").toDate();
  const next30Days = moment().add(30, "days").endOf("day").toDate();
  const next7Days = moment().add(7, "days").endOf("day").toDate();
  const todayEnd = moment().endOf("day").toDate(); // e.g. 2025-07-08 23:59:59

  // Statistics based on publishDate
  const totalNews = await News.count();

  const todayNews = await News.count({
    where: {
      publishDate: {
        [Op.gte]: todayStart,
        [Op.lte]: todayEnd,
      },
    },
  });

  const weekNews = await News.count({
    where: {
      publishDate: {
        [Op.gte]: todayStart,
        [Op.lte]: next7Days,
      },
    },
  });

  const monthNews = await News.count({
    where: {
      publishDate: {
        [Op.gte]: todayStart,
        [Op.lte]: next30Days,
      },
    },
  });

  return {
    total: count,
    totalNews,
    todayNews,
    weekNews,
    monthNews,
    page: parseInt(page),
    limit: parseInt(limit),
    news: rows,
  };
};

// Service to retrieve news by id
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
