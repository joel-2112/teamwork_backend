import { Op } from "sequelize";
import db from "../models/index.js";
const { About } = db;
import fs from "fs";
import path from "path";

// Create about with image
export const createAboutService = async (data, checkOnly = false) => {
  const existingAbout = await About.findOne({
    where: {
      title: data.title,
      content: data.content,
    },
  });

  if (existingAbout) {
    throw new Error(
      "About section with the same title and content already exists"
    );
  }

  if (checkOnly) return null;

  return await About.create(data);
};

// Retrieve all about sections with pagination and optional title filter
export const getAllAboutService = async ({
  page = 1,
  limit = 10,
  title,
  search,
} = {}) => {
  const offset = (page - 1) * limit;
  const where = {};
  if (title) where.title = title;
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { content: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await About.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    abouts: rows,
  };
};

// Retrieve about section by ID
export const getAboutByIdService = async (id) => {
  const about = await About.findByPk(id);
  if (!about) throw new Error("About not found");
  return about;
};

// Update about section by id
export const updateAboutService = async (id, data) => {
  const about = await About.findByPk(id);
  if (!about) throw new Error("About not found");

  // Parse current values
  let currentValues = Array.isArray(about.values) ? about.values : [];

  if (data.values && Array.isArray(data.values)) {
    // Build updated values
    const updates = data.values;

    // Merge: update matching title or index
    const mergedValues = currentValues.map((existingVal) => {
      const update = updates.find((val) => val.title === existingVal.title);
      if (update) {
        return {
          title: update.title || existingVal.title,
          description: update.description || existingVal.description,
        };
      }
      return existingVal;
    });

    // Include new items (if not already in current values)
    updates.forEach((val) => {
      const exists = mergedValues.some((v) => v.title === val.title);
      if (!exists && val.title && val.description) {
        mergedValues.push({ title: val.title, description: val.description });
      }
    });

    // Assign merged result
    data.values = mergedValues;
  }

  return await about.update(data);
};

// Delete about section by id
export const deleteAboutService = async (id) => {
  const about = await About.findByPk(id);
  if (!about) throw new Error("About not found");

  // Delete associated image if it exists
  if (about.aboutImage) {
    const imagePath = path.join(
      process.cwd(),
      "uploads/assets",
      path.basename(about.aboutImage)
    );
    try {
      await fs.promises.unlink(imagePath);
      console.log(`Deleted image file: ${imagePath}`);
    } catch (err) {
      console.error(`Error deleting image file: ${err.message}`);
    }
  }

  // Delete the about record from DB
  return await about.destroy();
};
