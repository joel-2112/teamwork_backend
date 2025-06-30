import {
  createServiceService,
  getAllServicesService,
  getServiceByIdService,
  updateServiceService,
  deleteServiceService,
} from '../services/serviceService.js';

export const createService = async (req, res) => {
  try {
    const service = await createServiceService(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const { page, limit, title } = req.query;
    const services = await getAllServicesService({ page, limit, title });
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await getServiceByIdService(req.params.id);
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const service = await updateServiceService(req.params.id, req.body);
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    await deleteServiceService(req.params.id);
    res.status(204).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
