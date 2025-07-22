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
    const { title, content, mission, vision } = req.body;
    let { values } = req.body;

    // Parse and validate values
    if (typeof values === "string") {
      try {
        values = JSON.parse(values);
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Invalid JSON format for values" });
      }
    }

    if (!Array.isArray(values) || values.length === 0) {
      return res
        .status(400)
        .json({ message: "Values must be a non-empty array" });
    }

    for (let i = 0; i < values.length; i++) {
      const val = values[i];
      if (
        typeof val !== "object" ||
        typeof val.title !== "string" ||
        typeof val.description !== "string" ||
        val.title.trim().length < 3 ||
        val.description.trim().length < 5
      ) {
        return res.status(400).json({
          message: `Each value must have a valid 'title' (min 3 chars) and 'description' (min 5 chars). Error at index ${i}`,
        });
      }
    }

    // Check for existing entry
    const existingAbout = await createAboutService({ title, content }, true);

    // Save image if available
    let aboutImage = null;
    if (req.file) {
      const uniqueName = `picture-${Date.now()}${path.extname(req.file.originalname)}`;
      const savedPath = saveImageToDisk(req.file.buffer, uniqueName);

      aboutImage = `${req.protocol}://${req.get("host")}/uploads/assets/${uniqueName}`;
    }

    // Create about entry
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
    const { page, limit, title, search } = req.query;
    const abouts = await getAllAboutService({ page, limit, title, search });
    res.status(200).json({
      success: true,
      message: "All About retrieved successfully.",
      statistics: abouts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAboutById = async (req, res) => {
  try {
    const about = await getAboutByIdService(req.params.id);
    res.status(200).json({
      success: true,
      message: `About with id ${req.params.id} is: `,
      about: about,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateAbout = async (req, res) => {
  try {
    const about = await updateAboutService(req.params.id, req.body);
    res
      .status(200)
      .json({
        success: true,
        message: `About with id ${req.params.id} is successfully updated.`,
        about: about,
      });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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
