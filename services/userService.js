import { Op } from "sequelize";
import db from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import moment from "moment";
import { sendPasswordResetOtpEmail } from "../utils/sendEmail.js";
import redisClient from "../config/redisClient.js";
import { extractPublicIdFromUrl } from "../utils/cloudinaryHelpers.js";

const { User, Role, Partnership, Agent, Region, Zone, Woreda } = db;

export const getAllUsersService = async ({
  page = 1,
  limit = 10,
  status,
  search,
  roleId,
} = {}) => {
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.min(100, parseInt(limit) || 10);
  const offset = (parsedPage - 1) * parsedLimit;

  // Build filtered query for paginated results
  const filteredWhere = {};
  if (status) filteredWhere.status = status;
  if (roleId) filteredWhere.roleId = roleId;
  if (search) {
    filteredWhere[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  // Base where for stats (should NOT include search or status filter)
  const baseWhere = {};

  // Get all required roles in one query
  const roles = await Role.findAll({
    where: { name: ["admin", "user", "agent", "partner"] },
    attributes: ["id", "name"],
  });

  const roleMap = {};
  for (const role of roles) {
    roleMap[role.name] = role.id;
  }

  // Parallelize counts (based on full DB, not filtered query)
  const [
    totalUser,
    blockedUser,
    activeUser,
    totalAdmin,
    totalAgent,
    totalPartner,
  ] = await Promise.all([
    User.count({ where: baseWhere }),
    User.count({ where: { ...baseWhere, status: "blocked" } }),
    User.count({ where: { ...baseWhere, status: "active" } }),
    User.count({ where: { ...baseWhere, roleId: roleMap.admin } }),
    User.count({ where: { ...baseWhere, roleId: roleMap.agent } }),
    User.count({ where: { ...baseWhere, roleId: roleMap.partner } }),
  ]);

  // Get paginated, filtered users
  const { count, rows } = await User.findAndCountAll({
    where: filteredWhere,
    include: [
      { model: Role, attributes: ["id", "name"] },
      { model: Region, attributes: ["id", "name"] },
      { model: Zone, attributes: ["id", "name"] },
      { model: Woreda, attributes: ["id", "name"] },
    ],
    attributes: { exclude: ["password"] },
    order: [["createdAt", "DESC"]],
    limit: parsedLimit,
    offset,
    distinct: true,
  });

  return {
    totalUser,
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
    const requiredFields = ["name", "email", "password", "phoneNumber"];
    for (const field of requiredFields) {
      if (!data[field]) throw new Error(`Missing required field: ${field}`);
    }
    const adminRole = await Role.findByPk(data.roleId);
    if (!adminRole) throw new Error("Admin role not found");

    const allowedRoles = ["admin", "assistant", "regionAdmin", "zoneAdmin", "woredaAdmin"];

    if (!allowedRoles.includes(adminRole.name)) {
      throw new Error(
        "Please enter a valid role: admin, assistant, regionadmin, zoneAdmin, or woredaAdmin"
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

    if (data.regionId) {
      const region = await Region.findByPk(data.regionId);
      if (!region) throw new Error("Invalid Region");
    }

    if (data.zoneId) {
      const zone = await Zone.findByPk(data.zoneId);
      if (!zone) throw new Error("Invalid Zone");
      if (data.regionId != zone.regionId) {
        throw new Error(
          ` Zone ${zone.name} is not in region ${region.name} please enter correct zone.`
        );
      }
    }

    if (data.woredaId) {
      const woreda = await Woreda.findByPk(data.woredaId);
      if (!woreda) throw new Error("Invalid Woreda");
      if (data.zoneId != woreda.zoneId)
        throw new Error(
          `Woreda ${woreda.name} is not in zone ${zone.name}, please enter correct woreda.`
        );
    }

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

export const updateProfileService = async (user, data) => {
  const userFound = await User.findByPk(user.id);
  if (!userFound) throw new Error("User not found");

  let agentFound = null;
  if (userFound.role === "agent") {
    agentFound = await Agent.findOne({ where: { email: userFound.email } });
    if (!agentFound) throw new Error("Agent record not found");
  }

  // Delete old profile image if new one is provided
  if (data.profilePicture) {
    if (userFound.profilePicture) {
      const publicIdUser = extractPublicIdFromUrl(userFound.profilePicture);
      if (publicIdUser) {
        try {
          await cloudinary.uploader.destroy(publicIdUser);
        } catch (err) {
          console.warn("Failed to delete old user image:", err.message);
        }
      }
    }

    // Delete from Agent if applicable
    if (agentFound && agentFound.profilePicture) {
      const publicIdAgent = extractPublicIdFromUrl(agentFound.profilePicture);
      if (publicIdAgent) {
        try {
          await cloudinary.uploader.destroy(publicIdAgent);
        } catch (err) {
          console.warn("Failed to delete old agent image:", err.message);
        }
      }
    }
  }

  // Update User
  await userFound.update(data);

  if (agentFound && data.profilePicture) {
    await agentFound.update({ profilePicture: data.profilePicture });
  }

  return userFound;
};

// Step 1: Send OTP for password reset
export const sendPasswordResetOtpService = async (email) => {
  const user = await db.User.findOne({ where: { email } });
  if (!user) throw new Error("User with this email does not exist");

  const OTP = Math.floor(100000 + Math.random() * 900000).toString();

  await redisClient.set(`resetOtp:${email}`, OTP, "EX", 300); // 5 minutes expiry
  await sendPasswordResetOtpEmail(OTP, email);

  return { message: "OTP sent to your email for password reset" };
};

// Step 2: Verify OTP
export const verifyPasswordResetOtpService = async (email, inputOtp) => {
  const storedOtp = await redisClient.get(`resetOtp:${email}`);
  if (!storedOtp) throw new Error("OTP expired or not found");
  if (storedOtp !== inputOtp) throw new Error("Invalid OTP");

  await redisClient.del(`resetOtp:${email}`);
  await redisClient.set(`otpVerified:${email}`, "true", "EX", 600); // Allow password reset for 10 mins

  return {
    message: "OTP verified successfully. You can now reset your password.",
  };
};

// Step 3: Reset password
export const resetPasswordService = async (
  email,
  newPassword,
  confirmNewPassword
) => {
  const otpVerified = await redisClient.get(`otpVerified:${email}`);
  if (!otpVerified)
    throw new Error("OTP verification required before resetting password");

  if (newPassword !== confirmNewPassword)
    throw new Error("Passwords do not match");

  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");

  user.password = newPassword;
  await user.save();

  await redisClient.del(`otpVerified:${email}`);

  return { message: "Password has been reset successfully" };
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
    [
      moment(monthStart).toDate(),
      moment(monthStart).add(6, "days").endOf("day").toDate(),
    ],
    [
      moment(monthStart).add(7, "days").startOf("day").toDate(),
      moment(monthStart).add(13, "days").endOf("day").toDate(),
    ],
    [
      moment(monthStart).add(14, "days").startOf("day").toDate(),
      moment(monthStart).add(20, "days").endOf("day").toDate(),
    ],
    [
      moment(monthStart).add(21, "days").startOf("day").toDate(),
      monthEnd.toDate(),
    ],
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
    User.count({
      where: { createdAt: { [Op.between]: [todayStart, todayEnd] } },
    }),
    User.count({
      where: {
        createdAt: { [Op.between]: [monthStart.toDate(), monthEnd.toDate()] },
      },
    }),
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
