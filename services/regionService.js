import db from "../models/index.js";

const { Region, Zone, Woreda } = db;


// Create region
export const createRegionService = async (data) => {
  const { name } = data;
  return await Region.create({ name });
};

// Get all regions
export const getAllRegionsService = async () => {
  return await Region.findAll({
    include: [{ model: Zone, include: [Woreda] }],
  });
};

// Get region by id
export const getRegionByIdService = async (id) => {
  const region = await Region.findByPk(id, {
    include: [{ model: Zone, include: [Woreda] }],
  });
  if (!region) throw new Error("Region not found");
  return region;
};


// Update region
export const updateRegionService = async (id, data) => {
  const region = await Region.findByPk(id);
  if (!region) throw new Error("Region not found");
  return await region.update(data);
};


// Delete region
export const deleteRegionService = async (id) => {
  const region = await Region.findByPk(id);
  if (!region) throw new Error("Region not found");
  const zoneCount = await Zone.count({ where: { regionId: id } });
  if (zoneCount > 0) throw new Error("Region has associated zones");
  return await region.destroy();
};
