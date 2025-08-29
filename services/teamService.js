import { Op } from "sequelize";
import db from "../models/index.js";
const { Team, User } = db;
import fs from "fs";
import path from "path";

export const createTeamService = async (data) => {
  const team = await Team.create(data);
  return team;
};

export const getAllTeamService = async (
  page = 1,
  limit = 10,
  fullName,
  title,
  search
) => {
  const offset = (page - 1) * limit;
  const where = { isDeleted: false };
  if (fullName) where.fullName = { [Op.iLike]: `%${fullName}%` };
  if (title) where.email = { [Op.iLike]: `%${title}%` };
  if (search) {
    where[Op.or] = [
      { fullName: { [Op.iLike]: `%${search}%` } },
      { title: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Team.findAndCountAll({
    where,
    order: [["createdAt", "ASC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  const total = await Team.count({ where: { isDeleted: false } });

  return {
    total: total,
    page: parseInt(page),
    limit: parseInt(limit),
    services: rows,
  };
};

export const getTeamByIdService = async (id) => {
  const team = await Team.findOne({ where: { id, isDeleted: false } });
  return team;
};

export const updateTeamService = async (id, data) => {
  const team = await Team.findOne({ where: { id, isDeleted: false } });
  if (!team) throw new Error("Team not found.");

  // Delete old image if a new one is provided
  if (data.imageUrl && team.imageUrl) {
    try {
      const urlPath = new URL(team.imageUrl).pathname; 
      const localPath = path.join(process.cwd(), urlPath.replace(/^\/+/, ""));

      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        console.log("Deleted old team image:", localPath);
      } else {
        console.warn("Old team image not found:", localPath);
      }
    } catch (err) {
      console.warn("Failed to delete old team image:", err.message);
    }
  }

  await team.update(data);
  return team;
};

export const deleteTeamService = async (userId, id) => {
  const team = await Team.findOne({ where: { id, isDeleted: false } });
  if (!team) throw new Error("Team not found");
  const user = await User.findOne({ where: { id: userId, isDeleted: false } });
  if (!user) throw new Error("User not found");

  team.isDeleted = true;
  team.deletedBy = user.id;
  team.deletedAt = new Date();
  await team.save();
  return team;
};
