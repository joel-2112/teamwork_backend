// services/customerOrderService.js
const { Op } = require('sequelize');
const { CustomerOrder, Region, Zone, Woreda } = require('../models');

const createCustomerOrderService = async (data) => {
  const requiredFields = [
    'country',
    'sector',
    'orderTitle',
    'fullName',
    'sex',
    'roleInSector',
    'phoneNumber1',
    'shortDescription',
  ];
  for (const field of requiredFields) {
    if (!data[field]) throw new Error(`Missing required field: ${field}`);
  }

  if (data.country === 'Ethiopia') {
    if (!data.regionId || !data.zoneId || !data.woredaId) {
      throw new Error('Region, Zone, and Woreda are required for Ethiopian customers');
    }
    const region = await Region.findByPk(data.regionId);
    const zone = await Zone.findByPk(data.zoneId);
    const woreda = await Woreda.findByPk(data.woredaId);
    if (!region || !zone || !woreda) throw new Error('Invalid Region, Zone, or Woreda');
  } else {
    if (!data.manualRegion || !data.manualZone || !data.manualWoreda) {
      throw new Error('Manual Region, Zone, and Woreda are required for non-Ethiopian customers');
    }
  }

  return await CustomerOrder.create(data);
};

const getAllCustomerOrdersService = async ({ page = 1, limit = 10, status, country } = {}) => {
  const offset = (page - 1) * limit;
  const where = {};
  if (status) where.status = status;
  if (country) where.country = country;

  const { count, rows } = await CustomerOrder.findAndCountAll({
    where,
    include: [
      { model: Region, as: 'Region', attributes: ['id', 'name'] },
      { model: Zone, as: 'Zone', attributes: ['id', 'name'] },
      { model: Woreda, as: 'Woreda', attributes: ['id', 'name'] },
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    orders: rows,
  };
};

const getCustomerOrderByIdService = async (id) => {
  const order = await CustomerOrder.findByPk(id, {
    include: [
      { model: Region, as: 'Region', attributes: ['id', 'name'] },
      { model: Zone, as: 'Zone', attributes: ['id', 'name'] },
      { model: Woreda, as: 'Woreda', attributes: ['id', 'name'] },
    ],
  });
  if (!order) throw new Error('Customer order not found');
  return order;
};

const updateCustomerOrderService = async (id, data) => {
  const order = await CustomerOrder.findByPk(id);
  if (!order) throw new Error('Customer order not found');

  if (data.country === 'Ethiopia') {
    if (data.regionId || data.zoneId || data.woredaId) {
      const region = data.regionId ? await Region.findByPk(data.regionId) : order.regionId;
      const zone = data.zoneId ? await Zone.findByPk(data.zoneId) : order.zoneId;
      const woreda = data.woredaId ? await Woreda.findByPk(data.woredaId) : order.woredaId;
      if (!region || !zone || !woreda) throw new Error('Invalid Region, Zone, or Woreda');
    }
  } else {
    if (data.manualRegion || data.manualZone || data.manualWoreda) {
      if (!data.manualRegion || !data.manualZone || !data.manualWoreda) {
        throw new Error('Manual Region, Zone, and Woreda are required for non-Ethiopian customers');
      }
    }
  }

  return await order.update(data);
};

const deleteCustomerOrderService = async (id) => {
  const order = await CustomerOrder.findByPk(id);
  if (!order) throw new Error('Customer order not found');
  return await order.destroy();
};

const updateCustomerOrderStatusService = async (id, status) => {
  const order = await CustomerOrder.findByPk(id);
  if (!order) throw new Error('Customer order not found');
  return await order.update({ status });
};

module.exports = {
  createCustomerOrderService,
  getAllCustomerOrdersService,
  getCustomerOrderByIdService,
  updateCustomerOrderService,
  deleteCustomerOrderService,
  updateCustomerOrderStatusService,
};