import db from "../models/index.js";
import { Op } from "sequelize";
import moment from "moment";
import { extractPublicIdFromUrl } from "../utils/cloudinaryHelpers.js";
import { v2 as cloudinary } from "cloudinary";

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
  const where = { isDeleted: false };

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
  const rows  = await News.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  const total = await News.count({
    where: { isDeleted: false },
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
  const news = await News.findOne({ where: { id: id, isDeleted: false } });
  if (!news) throw new Error("News not found");
  return news;
};

// Service to update news by id
export const updateNews = async (id, data, file, req) => {
  const news = await News.findOne({ where: { id: id, isDeleted: false } });
  if (!news) throw new Error("News not found");

  if (file && file.path) {
    // Delete old image from Cloudinary if it exists
    if (news.imageUrl) {
      const publicId = extractPublicIdFromUrl(news.imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Save new image (already uploaded to Cloudinary via multer)
    data.imageUrl = file.path;
  }

  return await news.update(data);
};


// Service to delete news by id
// export const deleteNews = async (id) => {
//   const news = await News.findOne({ where: { id: id, isDeleted: false } });
//   if (!news) throw new Error("News not found");

//   // Delete associated image if it exists
//   if (news.imageUrl) {
//     const imagePath = path.join(
//       process.cwd(),
//       "uploads/assets",
//       path.basename(news.imageUrl)
//     );
//     try {
//       await fs.promises.unlink(imagePath);
//       console.log(`Deleted image file: ${imagePath}`);
//     } catch (err) {
//       console.error(`Error deleting image file: ${err.message}`);
//     }
//   }

//   // Delete the news record from DB
//   return await news.destroy();
// };

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
