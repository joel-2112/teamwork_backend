import { where } from "sequelize";
import db from "../models/index.js";
const { Partnership, User } = db;

// send partnership request
export const createPartnershipService = async (userId, data) => {
  const user = await User.findByPk(userId);
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

// get all partnerships with pagination, filtering, and searching
export const getAllPartnershipsService = async ({
  page = 1,
  limit = 10,
  status,
  ability,
  search,
} = {}) => {
  const offset = (page - 1) * limit;
  const where = { isDeleted: false };
  if (status) where.status = status;
  if (ability) where.abilityForPartnership = ability;
  if (search) {
    where[Op.or] = [
      { fullName: { [Op.ilike]: `%${search}%` } },
      { email: { [Op.ilike]: `%${search}%` } },
    ];
  }

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

// get partnership by ID
export const getPartnershipByIdService = async (id) => {
  const partnership = await Partnership.findByPk(id);
  if (!partnership) throw new Error("Partnership not found");
  return partnership;
};

// update partnership details
export const updatePartnershipService = async (partnershipId, userId, data) => {
  const partnership = await Partnership.findByPk(partnershipId, {
    where: { isDeleted: false },
  });
  if (!partnership) throw new Error("Partnership not found");

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  if (partnership.email !== user.email) {
    throw new Error("You can only update your own partnership request");
  }

  if (partnership.status !== "pending" && partnership.status !== "reviewed") {
    throw new Error(
      "You can only update a pending and reviewed partnership request"
    );
  }

  if (data.abilityForPartnership === "other" && !data.abilityDescription) {
    throw new Error(
      'Description is required when abilityForPartnership is "other"'
    );
  }

  const updatedPartnership = await partnership.update(data);
  return updatedPartnership;
};

// delete partnership
export const deletePartnershipService = async (partnershipId, userId) => {
  const partnership = await Partnership.findOne(partnershipId, {
    where: { isDeleted: false },
  });
  if (!partnership) throw new Error("Partnership not found");

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  if (partnership.email === user.email)
    throw new Error("You can not delete your own partnership request");

  partnership.isDeleted = true;
  partnership.deletedAt = new Date();
  partnership.deletedBy = user.id;
  await partnership.save();

  return partnership;
};

// update partnership status
export const updatePartnershipStatusService = async (
  partnershipId,
  userId,
  status
) => {
  const partnership = await Partnership.findOne(partnershipId, {
    where: { isDeleted: false },
  });
  if (!partnership) throw new Error("Partnership not found");

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  if (partnership.email === user.email)
    throw new Error("You can not update your own partnership request status");
  if (!["pending", "reviewed", "accepted", "rejected"].includes(status)) {
    throw new Error("Invalid status value");
  }

  const updatedPartnership = await partnership.update({ status });

  return updatedPartnership;
};

// get all my partnerships requests
export const getMyPartnershipsService = async (userId) => {
  const partnerships = await Partnership.findAll({
    where: { userId, isDeleted: false },
    order: [["createdAt", "DESC"]],
  });

  if (!partnerships || partnerships.length === 0) {
    throw new Error("No partnership requests found for this user");
  }

  return partnerships;
};

