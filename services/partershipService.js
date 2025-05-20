// services/partnershipService.js
const { Partnership } = require('../models');

const createPartnershipService = async (data) => {
  const requiredFields = ['fullName', 'sex', 'profession', 'abilityForPartnership', 'email', 'phoneNumber'];
  for (const field of requiredFields) {
    if (!data[field]) throw new Error(`Missing required field: ${field}`);
  }
  if (data.abilityForPartnership === 'other' && !data.abilityDescription) {
    throw new Error('Description is required when abilityForPartnership is "other"');
  }
  return await Partnership.create(data);
};

const getAllPartnershipsService = async ({ page = 1, limit = 10, status, ability } = {}) => {
  const offset = (page - 1) * limit;
  const where = {};
  if (status) where.status = status;
  if (ability) where.abilityForPartnership = ability;

  const { count, rows } = await Partnership.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    partnerships: rows,
  };
};

const getPartnershipByIdService = async (id) => {
  const partnership = await Partnership.findByPk(id);
  if (!partnership) throw new Error('Partnership not found');
  return partnership;
};

const updatePartnershipService = async (id, data) => {
  const partnership = await Partnership.findByPk(id);
  if (!partnership) throw new Error('Partnership not found');
  if (data.abilityForPartnership === 'other' && !data.abilityDescription) {
    throw new Error('Description is required when abilityForPartnership is "other"');
  }
  return await partnership.update(data);
};

const deletePartnershipService = async (id) => {
  const partnership = await Partnership.findByPk(id);
  if (!partnership) throw new Error('Partnership not found');
  return await partnership.destroy();
};

const updatePartnershipStatusService = async (id, status) => {
  const partnership = await Partnership.findByPk(id);
  if (!partnership) throw new Error('Partnership not found');
  return await partnership.update({ status });
};

module.exports = {
  createPartnershipService,
  getAllPartnershipsService,
  getPartnershipByIdService,
  updatePartnershipService,
  deletePartnershipService,
  updatePartnershipStatusService,
};