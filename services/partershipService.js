import db from "../models/index.js";
import { Op } from "sequelize";
import {
  sendPartnershipRequestConfirmationEmail,
  sendPartnershipStatusUpdateEmail,
} from "../utils/sendEmail.js";

const { Partnership, User, Role, Agent } = db;

// send partnership request
export const createPartnershipService = async (userId, data) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const adminRole = await Role.findOne({ where: { name: "admin" } });
  if (!adminRole) throw new Error("Admin role not found.");

  if (user.roleId === adminRole.id)
    throw new Error("Admin can not send partnership request.");

  const checkAgentRequest = await Agent.findOne({
    where: {
      email: user.email,
      agentStatus: { [Op.ne]: "cancelled" },
    },
  });
  if (checkAgentRequest)
    throw new Error(
      "User has already sent Agent request, cannot send agent and partnership request at the same time"
    );

  if (data.abilityForPartnership === "other" && !data.abilityDescription) {
    throw new Error(
      'Description is required when ability for Partnership is "other"'
    );
  }

  const isExist = await Partnership.findOne({
    where: { userId: user.id, isDeleted: false },
  });
  if (isExist)
    throw new Error(
      "You have already submitted a partnership request, Please wait for review."
    );

  const checkPhone = await Partnership.findOne({
    where: { phoneNumber: data.phoneNumber, isDeleted: false },
  });
  if (checkPhone)
    throw new Error("This phone number is already associated with an account");

  const partnership = await Partnership.create({
    ...data,
    userId: user.id,
    fullName: user.name,
    email: user.email,
  });

  // Update user role
  const role = await Role.findOne({ where: { name: "partner" } });
  if (!role) throw new Error("Partner role not found");

  const userToUpdate = await User.findByPk(partnership.userId);
  if (!userToUpdate) throw new Error("User not found after partnership creation");

  userToUpdate.roleId = role.id;
  await userToUpdate.save();

  await sendPartnershipRequestConfirmationEmail({
    userEmail: user.email,
    fullName: user.name,
  });

  return partnership;
};


// get all partnerships with pagination, filtering, and searching
export const getAllPartnershipsService = async ({
  page = 1,
  limit = 10,
  status,
  abilityForPartnership,
  search,
} = {}) => {
  const offset = (page - 1) * limit;
  const where = { isDeleted: false, status: { [Op.ne]: "cancelled" } };
  if (status) where.status = status;
  if (abilityForPartnership)
    where.abilityForPartnership = abilityForPartnership;
  if (search && Op.iLike) {
    where[Op.or] = [
      { fullName: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Partnership.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  const countPending = await Partnership.count({
    where: { status: "pending", isDeleted: false },
  });
  const countReviewed = await Partnership.count({
    where: { status: "reviewed", isDeleted: false },
  });
  const countAccepted = await Partnership.count({
    where: { status: "accepted", isDeleted: false },
  });
  const countRejected = await Partnership.count({
    where: { status: "rejected", isDeleted: false },
  });
  return {
    total: count,
    pending: countPending,
    accepted: countAccepted,
    rejected: countRejected,
    reviewed: countReviewed,
    page: parseInt(page),
    limit: parseInt(limit),
    partnerships: rows,
  };
};

// send all partnership for the public api
export const allPartnershipService = async () => {
  const partners = await Partnership.findAll({ where: { isDeleted: false } });

  if (!partners || partners.length === 0) {
    throw new Error("No partners found.");
  }

  return partners;
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
  const partnership = await Partnership.findOne({
    where: { id: partnershipId, isDeleted: false },
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

export const deleteMyPartnershipService = async (partnershipId, userId) => {
  const partnership = await Partnership.findByPk(partnershipId, {
    where: { isDeleted: false, status: "cancelled" },
  });
  if (!partnership) throw new Error("Partnership not found");

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  if (user.email !== partnership.email) {
    throw new Error("You are not authorized to delete this order");
  }

  // Soft delete the partnership
  partnership.isDeleted = true;
  partnership.deletedBy = userId;
  partnership.deletedAt = new Date();
  await partnership.save();

  return partnership;
};

// update partnership status
export const updatePartnershipStatusService = async (
  partnershipId,
  userId,
  status
) => {
  const partnership = await Partnership.findOne({
    where: {
      id: partnershipId,
      isDeleted: false,
    },
  });

  if (!partnership) throw new Error("Partnership not found");

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const partner = await User.findOne({ where: { email: partnership.email } });
  if (!partner) throw new Error("Partner with this email is not exist");

  if (partnership.email === user.email)
    throw new Error("You can not update your own partnership request status");

  if (!["pending", "reviewed", "accepted", "rejected"].includes(status)) {
    throw new Error("Invalid status value");
  }

  const previousStatus = partnership.status;

  const updatedPartnership = await partnership.update({ status });

  await sendPartnershipStatusUpdateEmail({
    userEmail: partner.email,
    fullName: partnership.fullName,
    status,
  });

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

// Cancel user partnership request
export const cancelMyPartnershipRequestService = async (partnerId, userId) => {
  const partner = await Partnership.findOne({
    where: { id: partnerId, isDeleted: false },
  });
  if (!partner) throw new Error("Partner not found.");

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found.");

  if (partner.status === "cancelled")
    throw new Error("Partner Request already cancelled.");

  if (partner.userId !== user.id)
    throw new Error(
      "You are not authorized to cancel partnership requests, only cancel your own request"
    );

  partner.status = "cancelled";
  await partner.save();

  return partner;
};
