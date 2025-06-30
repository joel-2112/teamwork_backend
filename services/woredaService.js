import db from '../models/index.js';
const { Woreda, Zone } = db


export const createWoreda = async (data) => {
  const { name, zoneId } = data;
  const zone = await Zone.findByPk(zoneId);
  if (!zone) throw new Error('Invalid Zone');
  return await Woreda.create({ name, zoneId });
};

export const getAllWoredas = async () => {
  return await Woreda.findAll({
    include: [Zone],
  });
};

export const getWoredaById = async (id) => {
  const woreda = await Woreda.findByPk(id, {
    include: [Zone],
  });
  if (!woreda) throw new Error('Woreda not found');
  return woreda;
};

export const updateWoreda = async (id, data) => {
  const woreda = await Woreda.findByPk(id);
  if (!woreda) throw new Error('Woreda not found');
  if (data.zoneId) {
    const zone = await Zone.findByPk(data.zoneId);
    if (!zone) throw new Error('Invalid Zone');
  }
  return await woreda.update(data);
};

export const deleteWoreda = async (id) => {
  const woreda = await Woreda.findByPk(id);
  if (!woreda) throw new Error('Woreda not found');
  return await woreda.destroy();
};
