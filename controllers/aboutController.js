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

    // Duplicate check

    const existingAbout = await createAboutService({ title, content }, true);

    // Save image to disk only if file exists and about is valid
    let aboutImage = null;
    if (req.file) {
      const uniqueName = `picture-${Date.now()}${path.extname(req.file.originalname)}`;
      const savedPath = saveImageToDisk(req.file.buffer, uniqueName);

      // Construct full URL from the request
      aboutImage = `${req.protocol}://${req.get("host")}/uploads/assets/${uniqueName}`;
    }

    // Now create the about section
    const about = await createAboutService({
      title,
      content,
      aboutImage,
      mission,
      vision,
      values,
    });

    res.status(201).json({
      success: true,
      message: "About section created successfully.",
      about,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    res
      .status(200)
      .json({ success: true, message: "About deleted successfully." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
