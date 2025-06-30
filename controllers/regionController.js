import {
  createRegion,
  getAllRegions,
  getRegionById,
  updateRegion,
  deleteRegion,
} from '../services/regionService.js';

export const createRegionController = async (req, res) => {
  try {
    const region = await createRegion(req.body);
    res.status(201).json(region);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllRegionsController = async (req, res) => {
  try {
    const regions = await getAllRegions();
    res.status(200).json(regions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRegionByIdController = async (req, res) => {
  try {
    const region = await getRegionById(req.params.id);
    res.status(200).json(region);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const updateRegionController = async (req, res) => {
  try {
    const region = await updateRegion(req.params.id, req.body);
    res.status(200).json(region);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteRegionController = async (req, res) => {
  try {
    await deleteRegion(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
