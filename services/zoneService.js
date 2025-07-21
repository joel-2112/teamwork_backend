import db from "../models/index.js";
import { Op } from "sequelize";
const { Zone, Region, Woreda } = db;

// Create zone if it is not exist in the region of this zone
export const createZoneService = async (data) => {
  const { name, regionId } = data;
  const region = await Region.findByPk(regionId);
  const zone = await Zone.findOne({ where: { name, regionId } });
  if (zone) throw new Error("Zone of region already exist.");
  if (!region) throw new Error("Invalid region ID");
  return await Zone.create({ name, regionId });
};

// Retrieve all zone
export const getAllZonesService = async (page = 1, limit = 10, regionId, search) => {
  const offset = (page - 1) * limit;
  const where = {};

  if(regionId) where.regionId = regionId;
  if(search) where.name = { [Op.iLike]: `%${search}%` };

  const { count, rows } = await Zone.findAndCountAll({
    where,
    include: [
      {
        model: Woreda,
        as: "woredas",
      },
    ],
    distinct: true,
    offset,
    limit,
  });

  // Count all woredas in all zones
  const totalWoreda = await Woreda.count();

  return {
    totalZone: count, 
    totalWoreda,
    pages: parseInt(page),
    zones: rows,
  };
};

// Retrieve zone by id
export const getZoneByIdService = async (id) => {
  const zone = await Zone.findByPk(id, {
    include: [Region],
  });
  if (!zone) throw new Error("Zone not found");
  return zone;
};

// Get all wereda of zone by zoneId
export const getZoneByRegionIdService = async (regionId) => {
  const zones = await Zone.findAll({
    where: { regionId },
  });
  const region = await Region.findByPk(regionId);
  const regionName = region?.name || "Unknown";

  if (!zones || zones.length === 0) {
    throw new Error("This region has no zone.");
  }

  return { zones, regionName };
};

// Update zone
export const updateZoneService = async (id, data) => {
  const zone = await Zone.findByPk(id);
  if (!zone) throw new Error("Zone not found");
  if (data.regionId) {
    const region = await Region.findByPk(data.regionId);
    if (!region) throw new Error("Invalid Region ID");
  }
  return await zone.update(data);
};

// Delete zone
export const deleteZoneService = async (id) => {
  const zone = await Zone.findByPk(id);
  if (!zone) throw new Error("Zone not found");
  return await zone.destroy();
};
