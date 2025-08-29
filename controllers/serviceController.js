import {
  createServiceService,
  getAllServicesService,
  getServiceByIdService,
  updateServiceService,
  deleteServiceService,
} from "../services/serviceService.js";
import { Sequelize } from "sequelize";
import db from "../models/index.js";
const { Image, Service } = db;

export const createService = async (req, res) => {
  try {
    const { title, description } = req.body;
    const files = req.files;

    let imageUrl = null;
    let videoUrl = null;
    let fileUrl = null;

    // Build full URLs for uploaded files
    if (files?.imageUrl?.length) {
      imageUrl = `${req.protocol}://${req.get("host")}/${files.imageUrl[0].path.replace(/\\/g, "/")}`;
    }

    if (files?.videoUrl?.length) {
      videoUrl = `${req.protocol}://${req.get("host")}/${files.videoUrl[0].path.replace(/\\/g, "/")}`;
    }

    if (files?.fileUrl?.length) {
      fileUrl = `${req.protocol}://${req.get("host")}/${files.fileUrl[0].path.replace(/\\/g, "/")}`;
    }

    const service = await createServiceService({
      title,
      description,
      imageUrl,
      videoUrl,
      fileUrl,
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully.",
      service: [
        {
          id: service.id,
          title: service.title,
          description: service.description,
          imageUrl: service.imageUrl,
          videoUrl: service.videoUrl,
          fileUrl: service.fileUrl,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
        },
      ],
    });
  } catch (error) {
    if (
      error instanceof Sequelize.UniqueConstraintError ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Service with the same title and description already exist",
      });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};


export const getAllServices = async (req, res) => {
  try {
    const { page, limit, title, description, search } = req.query;
    const services = await getAllServicesService({
      page,
      limit,
      title,
      description,
      search,
    });
    res.status(200).json({
      success: true,
      message: "All service retrieved successfully.",
      services: services,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await getServiceByIdService(req.params.id);
    res.status(200).json({
      success: true,
      message: `Service with id ${req.params.id} is: `,
      service: service,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const updatedService = await updateServiceService(
      serviceId,
      req.body,
      req.files,
      req 
    );

    return res.status(200).json({
      success: true,
      message: "Service updated successfully.",
      service: updatedService,
    });
  } catch (error) {
    console.error("Service update error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};


export const deleteService = async (req, res) => {
  try {
    await deleteServiceService(req.params.id);
    res.status(200).json({
      success: true,
      message: `Service with id ${req.params.id} is successfully deleted.`,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
