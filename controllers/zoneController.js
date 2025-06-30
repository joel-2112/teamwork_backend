import {
  createZone,
  getAllZones,
  getZoneById,
  updateZone,
  deleteZone,
} from '../services/zoneService.js';

export const createZoneController = async (req, res) => {
  try {
    const zone = await createZone(req.body);
    res.status(201).json(zone);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllZonesController = async (req, res) => {
  try {
    const zones = await getAllZones();
    res.status(200).json(zones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getZoneByIdController = async (req, res) => {
  try {
    const zone = await getZoneById(req.params.id);
    res.status(200).json(zone);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const updateZoneController = async (req, res) => {
  try {
    const zone = await updateZone(req.params.id, req.body);
    res.status(200).json(zone);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteZoneController = async (req, res) => {
  try {
    await deleteZone(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
