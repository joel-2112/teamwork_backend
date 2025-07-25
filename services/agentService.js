import db from "../models/index.js";
import { Op } from "sequelize";

const { Agent, Partnership, Woreda, Zone, Region, User, Role } = db;

// Create ( send agent request ) agent
export const createAgentService = async (userId, data) => {
  const { regionId, zoneId, woredaId, email, phoneNumber } = data;

  const user = await User.findByPk(userId);
  if(!user) throw new Error("User not found.")


  const checkPartner = await Partnership.findOne({
    where: {
      email: user.email,
      agentStatus: {
        [Op.ne]: "cancelled",
      },
    },
  });
  if (checkPartner)
    throw new Error(
      "You have already submitted partnership request, can not send agent request"
    );

  const isExist = await Agent.findOne({ where: { email: email } });
  if (isExist) throw new Error("You have already submitted agent request");

  const phoneCheck = await Agent.findOne({
    where: { phoneNumber: phoneNumber },
  });
  if (phoneCheck) throw new Error("You have already used this phone number");

  const region = await Region.findByPk(regionId);
  if (!region) throw new Error("Invalid Region");

  const zone = await Zone.findByPk(zoneId);
  if (!zone) throw new Error("Invalid Zone");
  if (regionId !== zone.regionId)
    throw new Error(
      ` Zone ${zone.name} is not in region ${region.name} please enter correct zone.`
    );

  const woreda = await Woreda.findByPk(woredaId);
  if (!woreda) throw new Error("Invalid Woreda");
  if (zoneId !== woreda.zoneId)
    throw new Error(
      `Woreda ${woreda.name} is not in zone ${zone.name}, please enter correct woreda.`
    );

  const agent = await Agent.create(data);

  // Convert to plain object and replace IDs with names
  const agentData = agent.toJSON();

  return {
    ...agentData,
    region: region.name,
    zone: zone.name,
    woreda: woreda.name,
  };
};

// Retrieve all agent
export const getAllAgentsService = async (
  page = 1,
  limit = 10,
  filters = {}
) => {
  console.log("getAllAgents filters:", filters);
  const { search } = filters;
  const where = { isDeleted: false };

  if (search) {
    where[Op.or] = [
      { fullName: { [Op.like]: `%${search}%` } },
      { profession: { [Op.like]: `%${search}%` } },
      { educationLevel: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  if (filters.agentType) where.agentType = filters.agentType;
  if (filters.sex) where.sex = filters.sex;

  console.log("Where clause:", where);
  const offset = (page - 1) * limit;

  try {
    return await Agent.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        { model: Region, as: "Region", required: false },
        { model: Zone, as: "Zone", required: false },
        { model: Woreda, as: "Woreda", required: false },
      ],
    });
  } catch (error) {
    console.error("Error in getAllAgents:", error);
    throw error;
  }
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

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  if (agent.email !== user.email)
    throw new Error("User email does not match agent email");

  if (agent.agentStatus !== "pending" && agent.agentStatus !== "reviewed")
    throw new Error("Agent status is not pending or reviewed, cannot update");

  if (data.regionId) {
    const region = await Region.findByPk(data.regionId);
    if (!region) throw new Error("Invalid Region");
  }

  if (data.zoneId) {
    const zone = await Zone.findByPk(data.zoneId);
    if (!zone) throw new Error("Invalid Zone");
    if (data.regionId !== zone.regionId)
      throw new Error(
        `Zone ${zone.name} is not in region ${data.regionId}, please enter correct zone.`
      );
  }

  if (data.woredaId) {
    const woreda = await Woreda.findByPk(data.woredaId);
    if (!woreda) throw new Error("Invalid Woreda");
    if (data.zoneId !== woreda.zoneId)
      throw new Error(
        `Woreda ${woreda.name} is not in zone ${data.zoneId}, please enter correct woreda.`
      );
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
      await user.save();
    }
  }

  return updatedAgent;
};

// Delete agent by ID
export const deleteAgentService = async (userId, agentId) => {
  const agent = await Agent.findByPk(agentId, { where: { isDeleted: false } });
  if (!agent) throw new Error("Agent not found");

  agent.isDeleted = true;
  agent.deletedBy = userId;
  await agent.save();

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
    ],
    order: [["createdAt", "ASC"]],
    limit: parseInt(limit),
    page: parseInt(page),
  });
};
