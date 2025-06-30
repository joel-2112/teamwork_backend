import {
  createWoreda,
  getAllWoredas,
  getWoredaById,
  updateWoreda,
  deleteWoreda,
} from '../services/woredaService.js';

export const createWoredaController = async (req, res) => {
  try {
    const woreda = await createWoreda(req.body);
    res.status(201).json(woreda);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllWoredasController = async (req, res) => {
  try {
    const woredas = await getAllWoredas();
    res.status(200).json(woredas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWoredaByIdController = async (req, res) => {
  try {
    const woreda = await getWoredaById(req.params.id);
    res.status(200).json(woreda);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const updateWoredaController = async (req, res) => {
  try {
    const woreda = await updateWoreda(req.params.id, req.body);
    res.status(200).json(woreda);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteWoredaController = async (req, res) => {
  try {
    await deleteWoreda(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
