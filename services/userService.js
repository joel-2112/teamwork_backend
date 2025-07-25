import { Op } from "sequelize";
import db from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const { User, Role, Partnership, Agent } = db;

export const getAllUsersService = async ({
  page = 1,
  limit = 10,
  status,
  search,
} = {}) => {
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.min(100, parseInt(limit) || 10);
  const offset = (parsedPage - 1) * parsedLimit;

  const where = {};
  if (status) where.status = status;

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  // Get all required roles in one query
  const roles = await Role.findAll({
    where: { name: ["admin", "user", "agent", "partner"] },
    attributes: ["id", "name"],
  });

  const roleMap = {};
  for (const role of roles) {
    roleMap[role.name] = role.id;
  }

  // Parallelize user role/status counts
  const [blockedUser, activeUser, totalAdmin, totalAgent, totalPartner] =
    await Promise.all([
      User.count({ where: { status: "blocked" } }),
      User.count({ where: { status: "active" } }),
      User.count({ where: { roleId: roleMap.admin } }),
      User.count({ where: { roleId: roleMap.agent } }),
      User.count({ where: { roleId: roleMap.partner } }),
    ]);

  // Get paginated users
  const { count, rows } = await User.findAndCountAll({
    where,
    include: [
      {
        model: Role,
        attributes: ["id", "name"],
      },
    ],
    attributes: { exclude: ["password"] },
    order: [["createdAt", "DESC"]],
    limit: parsedLimit,
    offset,
    distinct: true, // ensures correct count with join
  });

  return {
    totalUser: count,
    totalAdmin,
    totalAgent,
    totalPartner,
    activeUser,
    blockedUser,
    page: parsedPage,
    limit: parsedLimit,
    users: rows,
  };
};

export const getUserByIdService = async (id) => {
  const user = await User.findByPk(id, {
    include: [
      {
        model: Role,
        attributes: ["id", "name"],
      },
    ],
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

// Service to enable admin create an other admin
export const createAdminUserService = async ({ name, email, password }) => {
  try {
    const adminRole = await Role.findOne({ where: { name: "admin" } });
    if (!adminRole) throw new Error("Admin role not found");

    const checkPartner = await Partnership.findOne({
      where: {
        email,
        status: { [Op.ne]: "cancelled" },
      },
    });
    if (checkPartner)
      throw new Error(
        "User has already submitted a partnership request, so cannot be admin."
      );

    const checkAgent = await Agent.findOne({
      where: {
        email,
        agentStatus: { [Op.ne]: "cancelled" },
      },
    });
    if (checkAgent)
      throw new Error(
        "User has already submitted an agent request, so cannot be admin."
      );

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      existingUser.roleId = adminRole.id;
      await existingUser.save();
      return existingUser;
    }

    // Create a new admin user
    const newUser = await User.create({
      name,
      email,
      password,
      roleId: adminRole.id,
    });

    return newUser;
  } catch (err) {
    throw new Error(err.message || "Failed to create or update admin.");
  }
};

// Block user
export const updateUserStatusService = async (id, status) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found.");

  if (user.status === "blocked" && status === "blocked")
    throw new Error(`'${user.name}' has already been blocked.`);

  if (user.status === "active" && status === "active")
    throw new Error(`'${user.name}' is already active.`);

  await user.update({ status });
  return user;
};

