import { Op } from "sequelize";
import db from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const { User } = db;

export const getAllUsersService = async ({
  page = 1,
  limit = 10,
  name,
} = {}) => {
  const offset = (page - 1) * limit;
  const where = {};
  if (name) where.name = { [Op.iLike]: `%${name}%` };

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ["password"] },
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    users: rows,
  };
};

export const getUserByIdService = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ["password"] },
  });
  if (!user) throw new Error("User not found");
  return user;
};

export const updateUserService = async (id, data) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");
  if (data.email && data.email !== user.email) {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) throw new Error("Email already exists");
  }
  return await user.update(data);
};

export const deleteUserService = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");
  return await user.destroy();
};
