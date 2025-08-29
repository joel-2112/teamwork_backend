import { Op } from "sequelize";
import db from "../models/index.js";
const { Service, Image, ServiceOrder } = db;
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
export const updateServiceService = async (id, data, files, req) => {
  const service = await Service.findByPk(id);
  if (!service) throw new Error("Service not found");

  // Helper: delete old file from disk
  const deleteOldFile = (fileUrl) => {
    if (!fileUrl) return;

    try {
      // remove base URL part
      const relativePath = fileUrl.replace(
        `${req.protocol}://${req.get("host")}/`,
        ""
      );
      const oldFilePath = path.join(process.cwd(), relativePath);

      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
        console.log("Deleted old file:", oldFilePath);
      }
    } catch (err) {
      console.warn("Failed to delete old file:", err.message);
    }
  };

  // Replace image if new one uploaded
  if (files?.imageUrl?.length > 0) {
    deleteOldFile(service.imageUrl);
    data.imageUrl = `${req.protocol}://${req.get("host")}/${files.imageUrl[0].path.replace(/\\/g, "/")}`;
  }

  // Replace video if new one uploaded
  if (files?.videoUrl?.length > 0) {
    deleteOldFile(service.videoUrl);
    data.videoUrl = `${req.protocol}://${req.get("host")}/${files.videoUrl[0].path.replace(/\\/g, "/")}`;
  }

  // Replace document if new one uploaded
  if (files?.fileUrl?.length > 0) {
    deleteOldFile(service.fileUrl);
    data.fileUrl = `${req.protocol}://${req.get("host")}/${files.fileUrl[0].path.replace(/\\/g, "/")}`;
  }

  return await service.update(data);
};



// Delete service by ID with its associated images
export const deleteServiceService = async (id) => {
  const service = await Service.findByPk(id);
  if (!service) throw new Error("Service not found");

  const existingOrder = await ServiceOrder.findOne({
    where: {
      serviceId: id,
      isDeleted: false,
    },
  });

  if (existingOrder) {
    throw new Error(
      "Cannot delete this service because it has already been ordered."
    );
  }

  return await service.destroy();
};
