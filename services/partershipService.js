import db from "../models/index.js";
const { Partnership } = db;

export const createPartnershipService = async (userId, data) => {
  
  const user = await db.User.findByPk(userId);
  if (!user) throw new Error("User not found");


  if (data.abilityForPartnership === "other" && !data.abilityDescription) {
    throw new Error(
      'Description is required when ability for Partnership is "other"'
    );
  }

  const partnership = await Partnership.create({
    ...data,
    userId: user.id,
    fullName: user.name,
    email: user.email,
  });
  return partnership;
};

export const getAllPartnershipsService = async ({
  page = 1,
  limit = 10,
  status,
  ability,
} = {}) => {
  const offset = (page - 1) * limit;
  const where = {};
  if (status) where.status = status;
  if (ability) where.abilityForPartnership = ability;

  const { count, rows } = await Partnership.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
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

export const getPartnershipByIdService = async (id) => {
  const partnership = await Partnership.findByPk(id);
  if (!partnership) throw new Error("Partnership not found");
  return partnership;
};

export const updatePartnershipService = async (id, data) => {
  const partnership = await Partnership.findByPk(id);
  if (!partnership) throw new Error("Partnership not found");
  if (data.abilityForPartnership === "other" && !data.abilityDescription) {
    throw new Error(
      'Description is required when abilityForPartnership is "other"'
    );
  }
  return await partnership.update(data);
};

export const deletePartnershipService = async (id) => {
  const partnership = await Partnership.findByPk(id);
  if (!partnership) throw new Error("Partnership not found");
  return await partnership.destroy();
};

export const updatePartnershipStatusService = async (id, status) => {
  const partnership = await Partnership.findByPk(id);
  if (!partnership) throw new Error("Partnership not found");
  return await partnership.update({ status });
};
