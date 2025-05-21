// services/serviceService.js
const { Op } = require('sequelize');
const { Service } = require('../models');

const createServiceService = async (data) => {
  const requiredFields = ['title', 'description'];
  for (const field of requiredFields) {
    if (!data[field]) throw new Error(`Missing required field: ${field}`);
  }
  return await Service.create(data);
};

const getAllServicesService = async ({ page = 1, limit = 10, title } = {}) => {
  const offset = (page - 1) * limit;
  const where = {};
  if (title) where.title = { [Op.iLike]: `%${title}%` };

  const { count, rows } = await Service.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    services: rows,
  };
};

const getServiceByIdService = async (id) => {
  const service = await Service.findByPk(id);
  if (!service) throw new Error('Service not found');
  return service;
};

const updateServiceService = async (id, data) => {
  const service = await Service.findByPk(id);
  if (!service) throw new Error('Service not found');
  return await service.update(data);
};

const deleteServiceService = async (id) => {
  const service = await Service.findByPk(id);
  if (!service) throw new Error('Service not found');
  return await service.destroy();
};

module.exports = {
  createServiceService,
  getAllServicesService,
  getServiceByIdService,
  updateServiceService,
  deleteServiceService,
};