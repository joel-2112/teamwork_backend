import db from "../models/index.js";
const { Woreda, Zone } = db;

// Create woreda
export const createWoredaService = async (data) => {
  const { name, zoneId } = data;
  const zone = await Zone.findByPk(zoneId);
  const woreda = await Woreda.findOne({ where: { name, zoneId } });
  if (woreda) throw new Error("Woreda of this zone already exist.");
  if (!zone) throw new Error("Invalid Zone");
  return await Woreda.create({ name, zoneId });
};

// Retrieve all woreda
export const getAllWoredasService = async () => {
  return await Woreda.findAll({
    include: [Zone],
  });
};

// Retrieve woreda by id
export const getWoredaByIdService = async (id) => {
  const woreda = await Woreda.findByPk(id, {
    include: [Zone],
  });
  if (!woreda) throw new Error("Woreda not found");
  return woreda;
};

// Get all wereda of zone by zoneId
export const getworedaByZoneIdService = async (zoneId) => {
  const woredas = await Woreda.findAll({
    where: { zoneId },
  });
  const zone = await Zone.findByPk(zoneId);
  const zoneName = zone?.name || "Unknown";

  if (!woredas || woredas.length === 0) {
    throw new Error("This zone has no woredas.");
  }

  return { woredas, zoneName };
};

// Update woreda
export const updateWoredaService = async (id, data) => {
  const woreda = await Woreda.findByPk(id);
  if (!woreda) throw new Error("Woreda not found");
  if (data.zoneId) {
    const zone = await Zone.findByPk(data.zoneId);
    if (!zone) throw new Error("Invalid Zone");
  }
  return await woreda.update(data);
};

// Delete woreda
export const deleteWoredaService = async (id) => {
  const woreda = await Woreda.findByPk(id);
  if (!woreda) throw new Error("Woreda not found");
  return await woreda.destroy();
};
