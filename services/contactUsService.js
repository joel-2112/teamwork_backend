import db from "../models/index.js";
import { Op } from "sequelize";

const { ContactUs, User } = db;

export const createContactUsService = async (data) => {
  const contactUs = await ContactUs.create(data);
  return contactUs;
};

export const getContactUsByIdService = async (id) => {
  const contactUs = await ContactUs.findByPk(id, {where: {isDeleted: false}});
  return contactUs;
};

export const getAllContactUsService = async (
  page = 1,
  limit = 10,
  fullName,
  email,
  search
) => {
  try {
    const offset = (page - 1) * limit;
    const where = { isDeleted: false };
    if (fullName) where.fullName = { [Op.iLike]: `%${fullName}%` };
    if (email) where.email = { [Op.iLike]: `%${email}%` };
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await ContactUs.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      services: rows,
    };
  } catch (error) {
    throw new Error(error);
  }
};


export const deleteContactUsService = async (userId, id) => {
  const contactUs = await ContactUs.findByPk(id, {where: {isDeleted: false}});
  if (!contactUs) throw new Error("Contact Us not found");
  const user = await User.findOne({ where: { id: userId, isDeleted: false } });
  if (!user) throw new Error("User not found");

  contactUs.isDeleted = true;
  contactUs.deletedBy = user.id;
  contactUs.deletedAt = new Date();
  await contactUs.save();
  return contactUs;
};