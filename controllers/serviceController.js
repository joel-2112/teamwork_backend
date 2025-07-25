import {
  createServiceService,
  getAllServicesService,
  getServiceByIdService,
  updateServiceService,
  deleteServiceService,
} from "../services/serviceService.js";
import { saveImageToDisk } from "../utils/saveImage.js";
import { Sequelize } from "sequelize";
import fs from "fs";
import path from "path";
import db from "../models/index.js";
const { Image, Service } = db;

export const createService = async (req, res) => {
  try {
    const { title, description } = req.body;

    const service = await createServiceService({
      title,
      description,
    });

    // // Validate images
    // const files = req.files || [];
    // if (files.length < 1 || files.length > 5) {
    //   return res.status(400).json({
    //     message: "Please upload between 1 and 5 images for the event.",
    //   });
    // }

    // // Create service
    // const service = await createServiceService({
    //   title,
    //   description,
    // });

    // // Save images and link to the service
    // const imageRecords = await Promise.all(
    //   files.map((file) => {
    //     const uniqueName = `service-${Date.now()}-${file.originalname}`;
    //     saveImageToDisk(file.buffer, uniqueName);
    //     const imageUrl = `/uploads/assets/${uniqueName}`;
    //     return Image.create({ serviceId: service.id, imageUrl });
    //   })
    // );

    res.status(201).json({
      success: true,
      message: "Service created successfully.",
      service: [
        {
          id: service.id,
          title: service.title,
          description: service.description,
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
    const { title, description } = req.body;
    const serviceId = req.params.id;

    const updatedService = await updateServiceService(serviceId, {
      title,
      description,
    });
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
    res
      .status(200)
      .json({
        success: true,
        message: `Service with id ${req.params.id} is successfully deleted.`,
      });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
