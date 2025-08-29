import { Op } from "sequelize";
import db from "../models/index.js";
import fs from "fs";
const { About, User } = db;

// Create about with image
export const createAboutService = async (userId, data, checkOnly = false) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

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

  return await About.create({
    ...data,
    postedBy: user.id,
  });
};

// Retrieve all about sections with pagination and optional title filter
export const getAllAboutService = async ({
  page = 1,
  limit = 10,
  title,
  search,
} = {}) => {
  const offset = (page - 1) * limit;
  const where = { isDeleted: false };
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
  const about = await About.findOne({ where: { id: id, isDeleted: false } });
  if (!about) throw new Error("About not found");
  return about;
};

// Update about with its image
export const updateAboutService = async (id, data, file, req) => {
  const about = await About.findOne({ where: { id, isDeleted: false } });
  if (!about) throw new Error("About not found");

  // Handle multer local storage image update
  if (file && file.path) {
    // Delete old local image
    if (about.aboutImage) {
      const oldPath = about.aboutImage.replace(
        `${req.protocol}://${req.get("host")}/`,
        ""
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Assign new image URL from multer
    data.aboutImage = `${req.protocol}://${req.get("host")}/${file.path.replace(/\\/g, "/")}`;
  }

  // Handle values update
  if (data.values) {
    let parsedValues;

    try {
      parsedValues =
        typeof data.values === "string" ? JSON.parse(data.values) : data.values;
    } catch (err) {
      throw new Error("Values must be a valid JSON array.");
    }

    if (!Array.isArray(parsedValues)) {
      throw new Error("Values must be an array of objects.");
    }

    const updatedValues = parsedValues.map((newVal) => {
      if (!newVal.title || !newVal.description) {
        throw new Error("Each value must have a title and description.");
      }
      return {
        title: newVal.title,
        description: newVal.description,
      };
    });

    data.values = updatedValues;
  }

  return await about.update(data);
};

export const deleteAboutService = async (aboutId, userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found.");

  const about = await About.findOne({
    where: { id: aboutId, isDeleted: false },
  });
  if (!about) throw new Error("About not found or already deleted.");

  about.isDeleted = true;
  about.deletedBy = user.id;
  about.deletedAt = new Date();
  await about.save();

  return about;
};
