import {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
} from '../services/newsService.js';

export const createNewsController = async (req, res) => {
  try {
    const { title, content } = req.body;

    const imageUrl = req.file ? `/uploads/news-images/${req.file.filename}` : null;

    const news = await createNews({
      title,
      content,
      imageUrl,
    });

    res.status(201).json({success: true, message: "News created successfully.", news});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllNewsController = async (req, res) => {
  try {
    const news = await getAllNews();
    res.status(200).json({ success: true, message: "All news successfully fetch.", news});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNewsByIdController = async (req, res) => {
  try {
    const news = await getNewsById(req.params.id);
    res.status(200).json({ success: true, message: `News with id ${req.params.id}:`, news});
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateNewsController = async (req, res) => {
  try {
    const news = await updateNews(req.params.id, req.body);
    res.status(200).json({ success: true, message: "News update successfully.", news});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteNewsController = async (req, res) => {
  try {
    await deleteNews(req.params.id);
    res.status(200).json({success: true, message: "News deleted successfully."});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
