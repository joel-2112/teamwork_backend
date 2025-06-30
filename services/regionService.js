import db from '../models/index.js';

const { Region, Zone, Woreda } = db

export const createRegion = async (data) => {
  const { name } = data;
  return await Region.create({ name });
};

export const getAllRegions = async () => {
  return await Region.findAll({
    include: [{ model: Zone, include: [Woreda] }],
  });
};

export const getRegionById = async (id) => {
  const region = await Region.findByPk(id, {
    include: [{ model: Zone, include: [Woreda] }],
  });
  if (!region) throw new Error('Region not found');
  return region;
};

export const updateRegion = async (id, data) => {
  const region = await Region.findByPk(id);
  if (!region) throw new Error('Region not found');
  return await region.update(data);
};

export const deleteRegion = async (id) => {
  const region = await Region.findByPk(id);
  if (!region) throw new Error('Region not found');
  const zoneCount = await Zone.count({ where: { regionId: id } });
  if (zoneCount > 0) throw new Error('Region has associated zones');
  return await region.destroy();
};
