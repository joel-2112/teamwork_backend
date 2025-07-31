import {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
} from "../services/newsService.js";
import { saveImageToDisk } from "../utils/saveImage.js";
import fs from "fs";
import path from "path";

// Create news
export const createNewsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, publishDate, category, author, readTime } =
      req.body;

    // Duplicate check

    const existingNews = await createNews(userId, { title, content }, true);

    // Save image to disk only if file exists and news is valid
    let imageUrl = null;
    if (req.file) {
      const uniqueName = `picture-${Date.now()}${path.extname(req.file.originalname)}`;
      const savedPath = saveImageToDisk(req.file.buffer, uniqueName);
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/assets/${uniqueName}`;
    }

    // Now create the news
    const news = await createNews(userId, {
      title,
      content,
      imageUrl,
      publishDate,
      category,
      author,
      readTime,
    });

    res.status(201).json({
      success: true,
      message: "News created successfully.",
      news,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Retrieve all news
export const getAllNewsController = async (req, res) => {
  try {
    const { page, limit, title, search, byDate, byCategory, byCompany } =
      req.query;

    const newsData = await getAllNews({
      page,
      limit,
      title,
      search,
      byDate,
      byCategory,
      byCompany,
    });

    res.status(200).json({
      success: true,
      message: "All news successfully fetched.",
      statistics: {
        totalNews: newsData.total,
        todayNews: newsData.todayNews,
        thisWeekNews: newsData.weekNews,
        thisMonthNews: newsData.monthNews,
        page: newsData.page,
        limit: newsData.limit,
      },
      news: newsData.news,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Retrieve news by id
export const getNewsByIdController = async (req, res) => {
  try {
    const news = await getNewsById(req.params.id);
    res
      .status(200)
      .json({ success: true, message: `News with id ${req.params.id}:`, news });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Update news by id
export const updateNewsController = async (req, res) => {
  try {
    const news = await updateNews(req.params.id, req.body);
    res
      .status(200)
      .json({ success: true, message: "News update successfully.", news });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete news
export const deleteNewsController = async (req, res) => {
  try {
    await deleteNews(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "News deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
