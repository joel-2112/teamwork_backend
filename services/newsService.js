import db from "../models/index.js";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";
import { title } from "process";
import moment from "moment";
const { News, User } = db;

// service to create news
export const createNews = async (userId, data, checkOnly = false) => {
  const user = await User.findByPk(userId)
  if(!user) throw new Error("User not found");

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

  return await News.create({
    ...data,
    postedBy: user.id
  });
};

// Service to get all news
export const getAllNews = async ({
  page = 1,
  limit = 10,
  title,
  search,
  byDate, // "today", "this-week", "this-month"
  byCategory,
  byCompany,
} = {}) => {
  const offset = (page - 1) * limit;
  const where = {};

  // Filters
  if (title) where.title = title;
  if (byCategory) where.category = byCategory;
  if (byCompany) where.author = byCompany;

  if (search) {
    where[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }];
  }

  // Date range filters
  const now = moment();

  if (byDate === "today") {
    where.publishDate = {
      [Op.gte]: now.clone().startOf("day").toDate(),
      [Op.lte]: now.clone().endOf("day").toDate(),
    };
  } else if (byDate === "this-week") {
    where.publishDate = {
      [Op.gte]: now.clone().startOf("week").toDate(), // Sunday
      [Op.lte]: now.clone().endOf("week").toDate(), // Saturday
    };
  } else if (byDate === "this-month") {
    where.publishDate = {
      [Op.gte]: now.clone().startOf("month").toDate(),
      [Op.lte]: now.clone().endOf("month").toDate(),
    };
  }

  // Paginated data
  const { count, rows } = await News.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  // Full statistics (not filtered)
  const todayStart = moment().startOf("day").toDate();
  const todayEnd = moment().endOf("day").toDate();

  const weekStart = moment().startOf("week").toDate(); // Sunday
  const weekEnd = moment().endOf("week").toDate(); // Saturday

  const monthStart = moment().startOf("month").toDate();
  const monthEnd = moment().endOf("month").toDate();

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
        [Op.gte]: weekStart,
        [Op.lte]: weekEnd,
      },
    },
  });

  const monthNews = await News.count({
    where: {
      publishDate: {
        [Op.gte]: monthStart,
        [Op.lte]: monthEnd,
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
