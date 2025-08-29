import db from "../models/index.js";
import { Op } from "sequelize";
import moment from "moment";
import fs from "fs";
import path from "path";
const { News, User } = db;

// service to create news
export const createNews = async (userId, data, checkOnly = false) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

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

  if (data.author === "other") {
    if (!data.companyName)
      throw new Error("Company name is required for other authors");
  }

  return await News.create({
    ...data,
    postedBy: user.id,
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
  const where = {
    isDeleted: false,
    publishDate: {
      [Op.lte]: new Date(),
    },
  };

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
  const { count: filteredCount, rows } = await News.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  // Get total news without any filters (except isDeleted = false)
  const total = await News.count({
    where: { isDeleted: false },
  });

  // Full statistics (still respecting isDeleted)
  const todayStart = moment().startOf("day").toDate();
  const todayEnd = moment().endOf("day").toDate();

  const weekStart = moment().startOf("week").toDate();
  const weekEnd = moment().endOf("week").toDate();

  const monthStart = moment().startOf("month").toDate();
  const monthEnd = moment().endOf("month").toDate();

  const totalNews = await News.count({ where: { isDeleted: false } });

  const todayNews = await News.count({
    where: {
      isDeleted: false,
      publishDate: {
        [Op.gte]: todayStart,
        [Op.lte]: todayEnd,
      },
    },
  });

  const weekNews = await News.count({
    where: {
      isDeleted: false,
      publishDate: {
        [Op.gte]: weekStart,
        [Op.lte]: weekEnd,
      },
    },
  });

  const monthNews = await News.count({
    where: {
      isDeleted: false,
      publishDate: {
        [Op.gte]: monthStart,
        [Op.lte]: monthEnd,
      },
    },
  });

  return {
    total, // now always counts ALL news (isDeleted = false), ignoring filters
    filteredTotal: filteredCount, // optional: shows count after filters
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
  const news = await News.findOne({ where: { id: id, isDeleted: false } });
  if (!news) throw new Error("News not found");
  return news;
};

// Service to update news by id
export const updateNews = async (id, data, file, req) => {
  const news = await News.findOne({ where: { id: id, isDeleted: false } });
  if (!news) throw new Error("News not found");

  if (file && file.path) {
    // Delete old image from local storage if it exists
    if (news.imageUrl) {
      try {
        const relativePath = news.imageUrl.replace(
          `${req.protocol}://${req.get("host")}/`,
          ""
        );

        // Build absolute local path
        const oldFilePath = path.join(process.cwd(), relativePath);

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log("Deleted old news image:", oldFilePath);
        } else {
          console.warn("Old news image not found:", oldFilePath);
        }
      } catch (err) {
        console.warn("Failed to delete old news image:", err.message);
      }
    }

    // Save new image URL
    data.imageUrl = `${req.protocol}://${req.get("host")}/${file.path.replace(/\\/g, "/")}`;
  }

  return await news.update(data);
};

export const deleteNews = async (newsId, userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error(" User not found");

  const news = await News.findOne({ where: { id: newsId, isDeleted: false } });
  if (!news) throw new Error("News not found or already deleted.");

  news.isDeleted = true;
  news.deletedBy = user.id;
  news.deletedAt = new Date();
  await news.save();

  return news;
};

export const newsStatistics = async () => {
  const now = moment().toDate(); // current time

  // === Time ranges ===
  const todayStart = moment().startOf("day").toDate();
  const todayEnd = moment().endOf("day").toDate();

  const monthStart = moment().startOf("month");
  const monthEnd = moment().endOf("month");

  const weekOneStart = moment(monthStart).toDate();
  const weekOneEnd = moment(monthStart).add(6, "days").endOf("day").toDate();

  const weekTwoStart = moment(monthStart)
    .add(7, "days")
    .startOf("day")
    .toDate();
  const weekTwoEnd = moment(monthStart).add(13, "days").endOf("day").toDate();

  const weekThreeStart = moment(monthStart)
    .add(14, "days")
    .startOf("day")
    .toDate();
  const weekThreeEnd = moment(monthStart).add(20, "days").endOf("day").toDate();

  const weekFourStart = moment(monthStart)
    .add(21, "days")
    .startOf("day")
    .toDate();
  const weekFourEnd = moment(monthEnd).toDate();

  // === Count news ===
  const todayNews = await News.count({
    where: {
      isDeleted: false,
      publishDate: { [Op.between]: [todayStart, todayEnd] },
    },
  });

  const weekOneNews = await News.count({
    where: {
      isDeleted: false,
      publishDate: { [Op.between]: [weekOneStart, weekOneEnd] },
    },
  });

  const weekTwoNews = await News.count({
    where: {
      isDeleted: false,
      publishDate: { [Op.between]: [weekTwoStart, weekTwoEnd] },
    },
  });

  const weekThreeNews = await News.count({
    where: {
      isDeleted: false,
      publishDate: { [Op.between]: [weekThreeStart, weekThreeEnd] },
    },
  });

  const weekFourNews = await News.count({
    where: {
      isDeleted: false,
      publishDate: { [Op.between]: [weekFourStart, weekFourEnd] },
    },
  });

  const thisMonthNews = await News.count({
    where: {
      isDeleted: false,
      publishDate: { [Op.between]: [monthStart.toDate(), monthEnd.toDate()] },
    },
  });

  const allNews = await News.count({
    where: { isDeleted: false },
  });

  const publishedNews = await News.count({
    where: {
      isDeleted: false,
      publishDate: { [Op.lte]: now },
    },
  });

  const draftNews = await News.count({
    where: {
      isDeleted: false,
      publishDate: { [Op.gt]: now },
    },
  });

  const archivedNews = await News.count({ where: { isDeleted: true } });

  return {
    todayNews,
    weekOneNews,
    weekTwoNews,
    weekThreeNews,
    weekFourNews,
    thisMonthNews,
    allNews,
    publishedNews,
    draftNews,
    archivedNews,
  };
};
