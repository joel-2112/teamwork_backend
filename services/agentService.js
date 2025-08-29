import db from "../models/index.js";
import { Op } from "sequelize";
import {
  sendAgentRequestConfirmationEmail,
  sendAgentStatusUpdateEmail,
} from "../utils/sendEmail.js";
import { extractPublicIdFromUrl } from "../utils/cloudinaryHelpers.js";
const { Agent, Partnership, Woreda, Zone, Region, User, Role } = db;

export const createAgentService = async (userId, data) => {
  const { regionId, zoneId, woredaId, phoneNumber, profilePicture, ...rest } =
    data;

  const parsedRegionId = Number(regionId);
  const parsedZoneId = Number(zoneId);
  const parsedWoredaId = Number(woredaId);

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found.");

  const checkPartner = await Partnership.findOne({
    where: {
      email: user.email,
      status: { [Op.ne]: "cancelled" },
    },
  });
  if (checkPartner)
    throw new Error(
      "You have already submitted partnership request, cannot send agent request"
    );

  const isExist = await Agent.findOne({ where: { userId: user.id } });
  if (isExist) throw new Error("You have already submitted agent request");

  const phoneCheck = await Agent.findOne({ where: { phoneNumber } });
  if (phoneCheck) throw new Error("You have already used this phone number");

  const emailCheck = await Agent.findOne({ where: { email: user.email } });
  if (emailCheck) throw new Error("You have already used this email");

  const region = await Region.findByPk(parsedRegionId);
  if (!region) throw new Error("Invalid Region");

  const zone = await Zone.findByPk(parsedZoneId);
  if (!zone) throw new Error("Invalid Zone");

  if (parsedRegionId !== zone.regionId)
    throw new Error(
      `Zone ${zone.name} is not in region ${region.name}, please enter correct zone.`
    );

  const woreda = await Woreda.findByPk(parsedWoredaId);
  if (!woreda) throw new Error("Invalid Woreda");

  if (parsedZoneId !== woreda.zoneId)
    throw new Error(
      `Woreda ${woreda.name} is not in zone ${zone.name}, please enter correct woreda.`
    );

  const agent = await Agent.create({
    ...rest,
    regionId: parsedRegionId,
    zoneId: parsedZoneId,
    woredaId: parsedWoredaId,
    email: user.email,
    fullName: user.name,
    phoneNumber,
    userId: user.id,
  });

  user.profilePicture = profilePicture;
  await user.save();

  await sendAgentRequestConfirmationEmail({
    userEmail: user.email,
    fullName: user.name,
  });

  const agentData = agent.toJSON();

  return {
    ...agentData,
    region: region.name,
    zone: zone.name,
    woreda: woreda.name,
  };
};

// Retrieve all agent
export const getAllAgents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      agentType,
      sex,
      regionId,
      zoneId,
      woredaId,
    } = req.query;
    const filters = { search, agentType, sex, regionId, zoneId, woredaId };

    const result = await getAllAgentsService(
      parseInt(page),
      parseInt(limit),
      filters,
      req.user
    );

    res.status(200).json({
      data: result.rows,
      total: result.total,
      page: parseInt(page),
      totalPages: Math.ceil(result.count / limit),
    });
  } catch (error) {
    console.error("Controller error in getAllAgents:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllAgentsService = async (
  page = 1,
  limit = 10,
  filters = {},
  user
) => {
  const { search, regionId, zoneId, woredaId, agentType, sex } = filters;
  const where = { isDeleted: false };

  if (search) {
    where[Op.or] = [
      { fullName: { [Op.like]: `%${search}%` } },
      { profession: { [Op.like]: `%${search}%` } },
      { educationLevel: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  if (regionId) where.regionId = regionId;
  if (zoneId) where.zoneId = zoneId;
  if (woredaId) where.woredaId = woredaId;
  if (agentType) where.agentType = agentType;
  if (sex) where.sex = sex;

  const userRole = user?.Role?.name;
  if (userRole === "regionAdmin") {
    where.regionId = user.regionId;
    where.agentType = "Region";
  } else if (userRole === "zoneAdmin") {
    where.zoneId = user.zoneId;
    where.agentType = "Zone";
  } else if (userRole === "woredaAdmin") {
    where.woredaId = user.woredaId;
    where.agentType = "Woreda";
  }

  const offset = (page - 1) * limit;

  // Get unfiltered total
  const total = await Agent.count({
    where: { isDeleted: false },
  });
  const regionAgent = await Agent.count({
    where: { agentType: "Region", isDeleted: false },
  });
  const zoneAgent = await Agent.count({
    where: { agentType: "Zone", isDeleted: false },
  });
  const woredaAgent = await Agent.count({
    where: { agentType: "Woreda", isDeleted: false },
  });

  // Get filtered paginated result
  const { count, rows } = await Agent.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      { model: Region, as: "Region", required: false },
      { model: Zone, as: "Zone", required: false },
      { model: Woreda, as: "Woreda", required: false },
    ],
    order: [["createdAt", "ASC"]],
  });

  return { rows, count, total, regionAgent, zoneAgent, woredaAgent };
};

// Retrieve agent by ID
export const getAgentByIdService = async (id) => {
  const agent = await Agent.findByPk(id, {
    where: { isDeleted: false },
    include: [
      { model: Region, as: "Region", required: false },
      { model: Zone, as: "Zone", required: false },
      { model: Woreda, as: "Woreda", required: false },
    ],
  });

  if (!agent) throw new Error("Agent not found");

  agent.agentStatus = "reviewed";
  await agent.save();

  return agent;
};

// Update agent by ID

export const updateAgentDataService = async (agentId, userId, data) => {
  const agent = await Agent.findByPk(agentId, { where: { isDeleted: false } });
  if (!agent) throw new Error("Agent not found");

  const user = await User.findByPk(userId, {
    include: [
      { model: Region, as: "Region" },
      { model: Zone, as: "Zone" },
      { model: Woreda, as: "Woreda" },
    ],
  });
  if (!user) throw new Error("User not found");

  if (agent.email !== user.email)
    throw new Error("User email does not match agent email");

  if (agent.agentStatus !== "pending" && agent.agentStatus !== "reviewed")
    throw new Error("Agent status is not pending or reviewed, cannot update");

  // Parse regionId, zoneId, woredaId to integers if present
  if (data.regionId) data.regionId = parseInt(data.regionId);
  if (data.zoneId) data.zoneId = parseInt(data.zoneId);
  if (data.woredaId) data.woredaId = parseInt(data.woredaId);

  // If not provided in the request body, get them from user's assigned location
  if (!data.regionId && user.Region) {
    data.regionId = user.Region.id;
  }

  if (!data.zoneId && user.Zone) {
    data.zoneId = user.Zone.id;
  }

  if (!data.woredaId && user.Woreda) {
    data.woredaId = user.Woreda.id;
  }

  // Validate Region
  if (data.regionId) {
    const region = await Region.findByPk(data.regionId);
    if (!region) throw new Error("Invalid Region");
  }

  // Validate Zone belongs to Region
  if (data.zoneId) {
    const zone = await Zone.findByPk(data.zoneId);
    if (!zone) throw new Error("Invalid Zone");
    if (
      (data.regionId && zone.regionId !== data.regionId) ||
      (!data.regionId && zone.regionId !== agent.regionId)
    ) {
      throw new Error(
        `Zone ${zone.name} is not in region ${data.regionId || agent.regionId}, please enter correct zone.`
      );
    }
  }

  // Validate Woreda belongs to Zone
  if (data.woredaId) {
    const woreda = await Woreda.findByPk(data.woredaId);
    if (!woreda) throw new Error("Invalid Woreda");
    if (
      (data.zoneId && woreda.zoneId !== data.zoneId) ||
      (!data.zoneId && woreda.zoneId !== agent.zoneId)
    ) {
      throw new Error(
        `Woreda ${woreda.name} is not in zone ${data.zoneId || agent.zoneId}, please enter correct woreda.`
      );
    }
  }

  // Delete old profile image from Cloudinary if new one is provided
  if (data.profilePicture && agent.profilePicture) {
    const oldUrl = agent.profilePicture;
    const publicId = extractPublicIdFromUrl(oldUrl);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn("Failed to delete old image:", err.message);
      }
    }
  }

  return await agent.update(data);
};

// Update agent Status by ID
export const updateAgentStatusService = async (id, status) => {
  const agent = await Agent.findByPk(id, { where: { isDeleted: false } });
  if (!agent) throw new Error("Agent not found");

  const user = await User.findOne({ where: { email: agent.email } });
  if (!user) throw new Error("User not found");

  const wasAccepted = agent.agentStatus === "accepted"; // current status before update

  const updatedAgent = await agent.update({ agentStatus: status });

  if (status === "accepted" && !wasAccepted) {
    const role = await Role.findOne({ where: { name: "agent" } });
    if (!role) throw new Error("Agent role not found");

    if (user.roleId !== role.id) {
      user.roleId = role.id;
      user.regionId = agent.regionId;
      user.zoneId = agent.zoneId;
      user.woredaId = agent.woredaId;
      await user.save();
    }
  }

  // Send status email (skip cancelled)
  if (status !== "cancelled") {
    await sendAgentStatusUpdateEmail({
      userEmail: agent.email,
      fullName: agent.fullName,
      agentStatus: status,
    });
  }

  return updatedAgent;
};

export const cancelAgentService = async (agentId, userId) => {
  const agent = await Agent.findOne({
    where: { id: agentId, isDeleted: false },
  });
  if (!agent) throw new Error("Agent is not found.");

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found.");

  if (agent.email !== user.email)
    throw new Error("You are not authorized to cancel this agent request.");

  agent.agentStatus = "cancelled";
  await agent.save();

  return agent;
};

// Delete agent by ID
export const deleteAgentService = async (userId, agentId) => {
  const agent = await Agent.findByPk(agentId, { where: { isDeleted: false } });
  if (!agent) throw new Error("Agent not found");
  const user = await User.findOne({
    where: { id: agent.userId, isDeleted: false },
  });
  if (!user) throw new Error("User not found");
  const role = await Role.findOne({ where: { name: "user" } });
  if (!role) throw new Error("Role not found");

  agent.isDeleted = true;
  agent.deletedBy = userId;
  agent.deletedAt = new Date();
  await agent.save();

  user.roleId = role.id;
  await user.save();

  return agent;
};

// Retrieve all deleted agent
export const getAllDeletedAgentService = async ({
  page = 1,
  limit = 10,
  fullName,
  profession,
  email,
  search,
} = {}) => {
  const where = { isDeleted: true };
  const offset = (page - 1) * limit;

  if (fullName) where.fullName = fullName;
  if (profession) where.profession = profession;
  if (email) where.email = email;
  if (search) {
    where[Op.or] = [
      { fullName: { [Op.iLike]: `%${search}%` } },
      { profession: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }
  const { count, rows } = await Agent.findAndCountAll({
    where,
    include: [
      {
        model: User,
        attributes: ["name", "email", "id"],
      },
    ],
    distinct: true,
    order: [["createdAt", "ASC"]],
    page: parseInt(page),
    limit: parseInt(limit),
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    deletedAgent: rows,
  };
};

// Get my agent request
export const getMyAgentRequestService = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const agent = await Agent.findOne({
    where: { email: user.email, isDeleted: false },
    include: [
      { model: Region, as: "Region", required: false },
      { model: Zone, as: "Zone", required: false },
      { model: Woreda, as: "Woreda", required: false },
    ],
  });
  if (!agent) throw new Error("Agent request not found");

  return agent;
};

// Get all approved agents
export const getAllApprovedAgentsService = async ({
  page = 1,
  limit = 10,
} = {}) => {
  const offset = (page - 1) * limit;
  return await Agent.findAll({
    where: { agentStatus: "accepted", isDeleted: false },
    include: [
      { model: Region, as: "Region", required: false },
      { model: Zone, as: "Zone", required: false },
      { model: Woreda, as: "Woreda", required: false },
      { model: User, attributes: ["profilePicture"], required: false },
    ],
    order: [["createdAt", "ASC"]],
    limit: parseInt(limit),
    page: parseInt(page),
  });
};
