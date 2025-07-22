import { Op } from "sequelize";
import db from "../models/index.js";
const { Service, Image } = db;
import fs from "fs";
import path from "path";

// Service creation service
export const createServiceService = async (data) => {
  const requiredFields = ["title", "description"];
  for (const field of requiredFields) {
    if (!data[field]) throw new Error(`Missing required field: ${field}`);
  }
  const service = await Service.create(data);
  return service;
};

// Retrieve all services with pagination and filtering
export const getAllServicesService = async ({
  page = 1,
  limit = 10,
  title,
  description,
  search,
} = {}) => {
  const offset = (page - 1) * limit;
  const where = {};
  if (title) where.title = { [Op.iLike]: `%${title}%` };
  if (description) where.description = { [Op.iLike]: `%${description}%` };
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Service.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
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

// Retrieve a service by ID
export const getServiceByIdService = async (id) => {
  const service = await Service.findByPk(id);
  if (!service) throw new Error("Service not found");
  return service;
};

// Update a service by ID
export const updateServiceService = async (id, data) => {
  const service = await Service.findByPk(id);
  if (!service) throw new Error("Service not found");
  return await service.update(data);
};

// Delete service by ID with its associated images
export const deleteServiceService = async (id) => {
  const service = await Service.findByPk(id);
  if (!service) throw new Error("Service not found");
  // Finally delete the event itself
  return await service.destroy();
};
