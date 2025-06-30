import {
  createAboutService,
  getAllAboutService,
  getAboutByIdService,
  updateAboutService,
  deleteAboutService,
} from '../services/aboutService.js';

export const createAbout = async (req, res) => {
  try {
    const about = await createAboutService(req.body);
    res.status(201).json({ success: true, data: about });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllAbout = async (req, res) => {
  try {
    const { page, limit, title } = req.query;
    const abouts = await getAllAboutService({ page, limit, title });
    res.status(200).json({ success: true, data: abouts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAboutById = async (req, res) => {
  try {
    const about = await getAboutByIdService(req.params.id);
    res.status(200).json({ success: true, data: about });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

export const updateAbout = async (req, res) => {
  try {
    const about = await updateAboutService(req.params.id, req.body);
    res.status(200).json({ success: true, data: about });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteAbout = async (req, res) => {
  try {
    await deleteAboutService(req.params.id);
    res.status(204).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
