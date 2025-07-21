import { create } from "domain";
import {
  createAboutService,
  getAllAboutService,
  getAboutByIdService,
  updateAboutService,
  deleteAboutService,
} from "../services/aboutService.js";
import { saveImageToDisk } from "../utils/saveImage.js";
import fs from "fs";
import path from "path";

export const createAbout = async (req, res) => {
  try {
    const { title, content, mission, vision, values } = req.body;

    let about = await createAboutService({
      title,
      content,
      mission,
      vision,
      values,
      aboutImage: null, // Initially null, will update after image save
    });

    // Save image only if DB save is successful
    if (req.file && req.file.buffer) {
      const uniqueName = `picture-${Date.now()}${path.extname(req.file.originalname)}`;
      const savedPath = saveImageToDisk(req.file.buffer, uniqueName);
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/assets/${uniqueName}`;

      // Update the aboutImage field in DB
      await about.update({ aboutImage: imageUrl });

      // Reflect the update in the response
      about = await about.reload();
    }

    res.status(200).json({
      success: true,
      message: "About section created successfully.",
      about,
    });
  } catch (error) {
    console.error("Error creating about section:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllAbout = async (req, res) => {
  try {
    const { page, limit, title } = req.query;
    const abouts = await getAllAboutService({ page, limit, title });
    res.status(200).json({ success: true, data: abouts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAboutById = async (req, res) => {
  try {
    const about = await getAboutByIdService(req.params.id);
    res.status(200).json({ success: true, data: about });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

export const updateAbout = async (req, res) => {
  try {
    const about = await updateAboutService(req.params.id, req.body);
    res.status(200).json({ success: true, data: about });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteAbout = async (req, res) => {
  try {
    await deleteAboutService(req.params.id);
    res.status(204).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
