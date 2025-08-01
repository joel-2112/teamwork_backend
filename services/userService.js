import { Op } from "sequelize";
import db from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import moment from "moment";

const { User, Role, Partnership, Agent, Region, Zone, Woreda } = db;

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
      {
        model: Region,
        attributes: ["id", "name"],
      }
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
export const createAdminUserService = async (data) => {
  try {
    const requiredFields = [
      "name",
      "email",
      "password",
      "regionId",
      "zoneId",
      "woredaId",
      "roleId",
    ];
    for (const field of requiredFields) {
      if (!data[field]) throw new Error(`Missing required field: ${field}`);
    }
    const adminRole = await Role.findByPk(data.roleId);
    if (!adminRole) throw new Error("Admin role not found");

    const allowedRoles = ["region admin", "zone admin", "woreda admin"];

    if (!allowedRoles.includes(adminRole.name)) {
      throw new Error(
        "Please enter a valid role: region admin, zone admin, or woreda admin"
      );
    }

    const checkPartner = await Partnership.findOne({
      where: {
        email: data.email,
        status: { [Op.ne]: "cancelled" },
      },
    });
    if (checkPartner)
      throw new Error(
        "User has already submitted a partnership request, so cannot be admin."
      );

    const checkAgent = await Agent.findOne({
      where: {
        email: data.email,
        agentStatus: { [Op.ne]: "cancelled" },
      },
    });
    if (checkAgent)
      throw new Error(
        "User has already submitted an agent request, so cannot be admin."
      );

    const region = await Region.findByPk(data.regionId);
    if (!region) throw new Error("Invalid Region");

    const zone = await Zone.findByPk(data.zoneId);
    if (!zone) throw new Error("Invalid Zone");
    if (data.regionId != zone.regionId) {
      throw new Error(
        ` Zone ${zone.name} is not in region ${region.name} please enter correct zone.`
      );
    }

    const woreda = await Woreda.findByPk(data.woredaId);
    if (!woreda) throw new Error("Invalid Woreda");
    if (data.zoneId != woreda.zoneId)
      throw new Error(
        `Woreda ${woreda.name} is not in zone ${zone.name}, please enter correct woreda.`
      );

    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      existingUser.roleId = adminRole.id;
      existingUser.regionId = data.regionId;
      existingUser.zoneId = data.zoneId;
      existingUser.woredaId = data.woredaId;
      await existingUser.save();
      return existingUser;
    }

    // Create a new admin user
    const newUser = await User.create(data);

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

// To send user statistics of the company
export const userStatisticsService = async () => {
  const adminRole = await Role.findOne({ where: { name: "admin" } });
  if (!adminRole) throw new Error("Role admin not found.");

  const agentRole = await Role.findOne({ where: { name: "agent" } });
  if (!agentRole) throw new Error("Role agent not found.");

  const partnerRole = await Role.findOne({ where: { name: "partner" } });
  if (!partnerRole) throw new Error("Role partner not found.");

  // === Time ranges ===
  const todayStart = moment().startOf("day").toDate();
  const todayEnd = moment().endOf("day").toDate();

  const monthStart = moment().startOf("month");
  const monthEnd = moment().endOf("month");

  // Divide the current month into four weeks
  const weekOneStart = moment(monthStart).toDate();
  const weekOneEnd = moment(monthStart).add(6, "days").endOf("day").toDate();

  const weekTwoStart = moment(monthStart)
    .add(7, "days")
    .startOf("day")
    .toDate();
  const weekTwoEnd = moment(monthStart).add(13, "days").endOf("day").toDate();

  const weekThreeStart = moment(monthStart)
    .add(14, "days")
    .startOf("day")
    .toDate();
  const weekThreeEnd = moment(monthStart).add(20, "days").endOf("day").toDate();

  const weekFourStart = moment(monthStart)
    .add(21, "days")
    .startOf("day")
    .toDate();
  const weekFourEnd = moment(monthEnd).toDate();

  // === Count users ===
  const todayUsers = await User.count({
    where: {
      createdAt: { [Op.between]: [todayStart, todayEnd] },
    },
  });

  const weekOneUsers = await User.count({
    where: {
      createdAt: { [Op.between]: [weekOneStart, weekOneEnd] },
    },
  });

  const weekTwoUsers = await User.count({
    where: {
      createdAt: { [Op.between]: [weekTwoStart, weekTwoEnd] },
    },
  });

  const weekThreeUsers = await User.count({
    where: {
      createdAt: { [Op.between]: [weekThreeStart, weekThreeEnd] },
    },
  });

  const weekFourUsers = await User.count({
    where: {
      createdAt: { [Op.between]: [weekFourStart, weekFourEnd] },
    },
  });

  const thisMonthUsers = await User.count({
    where: {
      createdAt: { [Op.between]: [monthStart.toDate(), monthEnd.toDate()] },
    },
  });

  const allUsers = await User.count();
  const allAdmins = await User.count({ where: { roleId: adminRole.id } });
  const allAgents = await User.count({ where: { roleId: agentRole.id } });
  const allPartners = await User.count({ where: { roleId: partnerRole.id } });
  const activeUsers = await User.count({ where: { status: "active" } });
  const inactiveUsers = await User.count({ where: { status: "blocked" } });

  return {
    totalUsers: allUsers,
    admins: allAdmins,
    agents: allAgents,
    partners: allPartners,
    activeUsers,
    inactiveUsers,
    todayUsers,
    thisMonthUsers,
    weekOneUsers,
    weekTwoUsers,
    weekThreeUsers,
    weekFourUsers,
  };
};
