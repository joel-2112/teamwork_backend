import {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
} from '../services/newsService.js';

export const createNewsController = async (req, res) => {
  try {
    const news = await createNews(req.body);
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllNewsController = async (req, res) => {
  try {
    const news = await getAllNews();
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNewsByIdController = async (req, res) => {
  try {
    const news = await getNewsById(req.params.id);
    res.status(200).json(news);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const updateNewsController = async (req, res) => {
  try {
    const news = await updateNews(req.params.id, req.body);
    res.status(200).json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteNewsController = async (req, res) => {
  try {
    await deleteNews(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
