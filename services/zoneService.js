import db from '../models/index.js';
const { Zone, Region } = db


export const createZone = async (data) => {
  const { name, regionId } = data;
  const region = await Region.findByPk(regionId);
  if (!region) throw new Error('Invalid region ID');
  return await Zone.create({ name, regionId });
};

export const getAllZones = async () => {
  return await Zone.findAll({
    include: [Region],
  });
};

export const getZoneById = async (id) => {
  const zone = await Zone.findByPk(id, {
    include: [Region],
  });
  if (!zone) throw new Error('Zone not found');
  return zone;
};

export const updateZone = async (id, data) => {
  const zone = await Zone.findByPk(id);
  if (!zone) throw new Error('Zone not found');
  if (data.regionId) {
    const region = await Region.findByPk(data.regionId);
    if (!region) throw new Error('Invalid Region ID');
  }
  return await zone.update(data);
};

export const deleteZone = async (id) => {
  const zone = await Zone.findByPk(id);
  if (!zone) throw new Error('Zone not found');
  return await zone.destroy();
};
