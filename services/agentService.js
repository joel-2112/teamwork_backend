import db from "../models/index.js";
import { Op } from "sequelize";

const { Agent, Woreda, Zone, Region } = db;

export const createAgentService = async (data) => {
  const { regionId, zoneId, woredaId } = data;

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

export const getAllAgentsService = async (
  page = 1,
  limit = 10,
  filters = {}
) => {
  console.log("getAllAgents filters:", filters);
  const { search } = filters;
  const where = {};

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

export const getAgentByIdService = async (id) => {
  const agent = await Agent.findByPk(id, {
    include: [
      { model: Region, as: "Region", required: false },
      { model: Zone, as: "Zone", required: false },
      { model: Woreda, as: "Woreda", required: false },
    ],
  });
  if (!agent) throw new Error("Agent not found");
  return agent;
};

export const updateAgentService = async (id, data) => {
  const agent = await Agent.findByPk(id);
  if (!agent) throw new Error("Agent not found");

  if (data.regionId) {
    const region = await Region.findByPk(data.regionId);
    if (!region) throw new Error("Invalid Region");
  }

  if (data.zoneId) {
    const zone = await Zone.findByPk(data.zoneId);
    if (!zone) throw new Error("Invalid Zone");
  }

  if (data.woredaId) {
    const woreda = await Woreda.findByPk(data.woredaId);
    if (!woreda) throw new Error("Invalid Woreda");
  }

  return await agent.update(data);
};

export const deleteAgentService = async (id) => {
  const agent = await Agent.findByPk(id);
  if (!agent) throw new Error("Agent not found");
  return await agent.destroy();
};
