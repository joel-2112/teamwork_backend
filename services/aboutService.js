import { Op } from "sequelize";
import db from "../models/index.js";
const { About } = db;

export const createAboutService = async (data) => {
  const requiredFields = ["title", "content", "mission", "vision", "values"];
  for (const field of requiredFields) {
    if (!data[field]) throw new Error(`Missing required field: ${field}`);
  }
  if (!Array.isArray(data.values) || data.values.length === 0) {
    throw new Error("Values must be a non-empty array");
  }

  const existingAbout = await About.findOne({
    where: {
      title: data.title,
      content: data.content,
    },
  });
  if (existingAbout) {
    throw new Error("About section with the same title and content already exists");
  }
  return await About.create(data);
};

export const getAllAboutService = async ({
  page = 1,
  limit = 10,
  title,
} = {}) => {
  const offset = (page - 1) * limit;
  const where = {};
  if (title) where.title = { [Op.iLike]: `%${title}%` };

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

export const getAboutByIdService = async (id) => {
  const about = await About.findByPk(id);
  if (!about) throw new Error("About not found");
  return about;
};

export const updateAboutService = async (id, data) => {
  const about = await About.findByPk(id);
  if (!about) throw new Error("About not found");
  if (
    data.values &&
    (!Array.isArray(data.values) || data.values.length === 0)
  ) {
    throw new Error("Values must be a non-empty array");
  }
  return await about.update(data);
};

export const deleteAboutService = async (id) => {
  const about = await About.findByPk(id);
  if (!about) throw new Error("About not found");
  return await about.destroy();
};
