import { Op, where } from "sequelize";
import db from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import moment from "moment";
import { sendPasswordResetEmail } from "../utils/sendEmail.js";

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
      },
      {
        model: Zone,
        attributes: ["id", "name"],
      },
      {
        model: Woreda,
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
      {
        model: Region,
        attributes: ["id", "name"],
      },
      {
        model: Zone,
        attributes: ["id", "name"],
      },
      {
        model: Woreda,
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

    const allowedRoles = ["regionAdmin", "zoneAdmin", "woredaAdmin"];

    if (!allowedRoles.includes(adminRole.name)) {
      throw new Error(
        "Please enter a valid role: regionadmin, zoneAdmin, or woredaAdmin"
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

// Change password
export const changePasswordService = async (user, data) => {
  // First, fetch user with password only (no includes yet)
  const foundUser = await User.findByPk(user.id);
  if (!foundUser) throw new Error("User not found.");

  const requiredFields = [
    "currentPassword",
    "newPassword",
    "confirmNewPassword",
  ];
  for (const field of requiredFields) {
    if (!data[field]) throw new Error(`Missing required field: ${field}`);
  }

  const isMatch = await bcrypt.compare(
    data.currentPassword,
    foundUser.password
  );
  if (!isMatch)
    throw new Error("Invalid current password, please enter the correct one.");

  const checkPrev = await bcrypt.compare(data.newPassword, foundUser.password);
  if (checkPrev)
    throw new Error(
      "You can not use the previous password please use new password."
    );

  if (data.newPassword !== data.confirmNewPassword)
    throw new Error("New password must be confirmed correctly.");

  foundUser.password = data.newPassword;
  await foundUser.save();

  // Re-fetch user (excluding password) with associations
  const updatedUser = await User.findByPk(user.id, {
    include: [
      {
        model: Role,
        attributes: ["id", "name"],
      },
      {
        model: Region,
        attributes: ["id", "name"],
      },
      {
        model: Zone,
        attributes: ["id", "name"],
      },
      {
        model: Woreda,
        attributes: ["id", "name"],
      },
    ],
    attributes: { exclude: ["password"] },
  });

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.Role.name,
    status: updatedUser.status,
    region: updatedUser.Region?.name,
    zone: updatedUser.Zone?.name,
    Woreda: updatedUser.Woreda?.name,
  };
};

// Service file
export const forgotPasswordService = async (email, clientUrl) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("No account registered with this email.");

  const resetToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_RESET_SECRET,
    { expiresIn: "15m" }
  );

  // clientUrl is already passed in from controller
  const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

  await sendPasswordResetEmail({
    userEmail: user.email,
    fullName: user.name,
    resetLink,
  });

  return { message: "Password reset link sent to your email." };
};

export const resetPasswordService = async (
  token,
  newPassword,
  confirmNewPassword
) => {
  if (newPassword !== confirmNewPassword) {
    throw new Error("Passwords do not match.");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token.");
  }

  const user = await User.findByPk(decoded.userId);
  if (!user) {
    throw new Error("User not found.");
  }

  user.password = newPassword;
  await user.save();

  return { message: "Password has been reset successfully." };
};

// To send user statistics of the company
export const userStatisticsService = async () => {
  // === Fetch all required roles in one query ===
  const roleNames = [
    "admin",
    "agent",
    "partner",
    "regionAdmin",
    "zoneAdmin",
    "woredaAdmin",
  ];

  const roles = await Role.findAll({
    where: { name: { [Op.in]: roleNames } },
  });

  const roleMap = {};
  for (const role of roles) {
    roleMap[role.name] = role.id;
  }

  // Ensure all roles are found
  for (const roleName of roleNames) {
    if (!roleMap[roleName]) {
      throw new Error(`Role ${roleName} not found.`);
    }
  }

  // === Time ranges ===
  const todayStart = moment().startOf("day").toDate();
  const todayEnd = moment().endOf("day").toDate();

  const monthStart = moment().startOf("month");
  const monthEnd = moment().endOf("month");

  const weeks = [
    [moment(monthStart).toDate(), moment(monthStart).add(6, "days").endOf("day").toDate()],
    [moment(monthStart).add(7, "days").startOf("day").toDate(), moment(monthStart).add(13, "days").endOf("day").toDate()],
    [moment(monthStart).add(14, "days").startOf("day").toDate(), moment(monthStart).add(20, "days").endOf("day").toDate()],
    [moment(monthStart).add(21, "days").startOf("day").toDate(), monthEnd.toDate()],
  ];

  // === Count queries in parallel ===
  const [
    allUsers,
    activeUsers,
    inactiveUsers,
    todayUsers,
    thisMonthUsers,
    weekOneUsers,
    weekTwoUsers,
    weekThreeUsers,
    weekFourUsers,
    allAdmins,
    allAgents,
    allPartners,
    allRegionAdmins,
    allZoneAdmins,
    allWoredaAdmins,
  ] = await Promise.all([
    User.count(),
    User.count({ where: { status: "active" } }),
    User.count({ where: { status: "blocked" } }),
    User.count({ where: { createdAt: { [Op.between]: [todayStart, todayEnd] } } }),
    User.count({ where: { createdAt: { [Op.between]: [monthStart.toDate(), monthEnd.toDate()] } } }),
    User.count({ where: { createdAt: { [Op.between]: weeks[0] } } }),
    User.count({ where: { createdAt: { [Op.between]: weeks[1] } } }),
    User.count({ where: { createdAt: { [Op.between]: weeks[2] } } }),
    User.count({ where: { createdAt: { [Op.between]: weeks[3] } } }),
    User.count({ where: { roleId: roleMap["admin"] } }),
    User.count({ where: { roleId: roleMap["agent"] } }),
    User.count({ where: { roleId: roleMap["partner"] } }),
    User.count({ where: { roleId: roleMap["regionAdmin"] } }),
    User.count({ where: { roleId: roleMap["zoneAdmin"] } }),
    User.count({ where: { roleId: roleMap["woredaAdmin"] } }),
  ]);

  return {
    totalUsers: allUsers,
    admins: allAdmins,
    agents: allAgents,
    partners: allPartners,
    regionAdmins: allRegionAdmins,
    zoneAdmins: allZoneAdmins,
    woredaAdmins: allWoredaAdmins,
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
