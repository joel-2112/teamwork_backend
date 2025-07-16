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
    const { title, description, replacedImages } = req.body;
    const serviceId = req.params.id;

    const service = await Service.findByPk(serviceId, {
      include: [{ model: Image, as: "images" }],
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found." });
    }

    // Update title & description
    await service.update({ title, description });

    const files = req.files || [];
    const parsedReplacedImages = replacedImages
      ? JSON.parse(replacedImages)
      : [];

    const existingImages = service.images;
    const existingImageCount = existingImages.length;

    const filesForReplacement = parsedReplacedImages.length;
    const filesForAdd = files.length - filesForReplacement;

    if (filesForReplacement > 0 && filesForReplacement > files.length) {
      return res.status(400).json({
        success: false,
        message:
          "Not enough uploaded files for the images you want to replace.",
      });
    }

    // Replace images
    const updatedImages = [];
    for (let i = 0; i < filesForReplacement; i++) {
      const imageId = parsedReplacedImages[i].imageId;
      const file = files[i];

      const image = await Image.findOne({ where: { id: imageId, serviceId } });

      if (!image) {
        return res.status(404).json({
          success: false,
          message: `Image with ID ${imageId} not found for this service.`,
        });
      }

      // Delete old image from disk
      const imagePath = path.join(
        process.cwd(),
        "uploads/assets",
        path.basename(image.imageUrl)
      );

      try {
        await fs.promises.unlink(imagePath);
      } catch (err) {
        console.warn(`Failed to delete old image: ${err.message}`);
      }

      // Save new image & update record
      const uniqueName = `service-${Date.now()}-${i}-${file.originalname}`;
      saveImageToDisk(file.buffer, uniqueName);
      const imageUrl = `/uploads/assets/${uniqueName}`;

      await image.update({ imageUrl });
      updatedImages.push(image);
    }

    // Add new images
    if (filesForAdd > 0) {
      const totalAfterAdd =
        existingImageCount - filesForReplacement + filesForAdd;
      if (totalAfterAdd > 5) {
        return res.status(400).json({
          success: false,
          message: `Adding ${filesForAdd} image(s) exceeds the max limit of 5 images.`,
        });
      }

      for (let i = filesForReplacement; i < files.length; i++) {
        const file = files[i];
        const uniqueName = `service-${Date.now()}-${i}-${file.originalname}`;
        saveImageToDisk(file.buffer, uniqueName);
        const imageUrl = `/uploads/assets/${uniqueName}`;
        await Image.create({ serviceId, imageUrl });
      }
    }

    // Return updated service with images
    const updatedService = await Service.findByPk(serviceId, {
      include: [{ model: Image, as: "images" }],
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
      .status(204)
      .json({
        success: true,
        message: `Service with id ${req.params.id} is successfully deleted.`,
      });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
