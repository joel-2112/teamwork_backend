import db from "../models/index.js";
import { Op } from "sequelize";
import moment from "moment";

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


    
      // Full statistics (still respecting isDeleted)
      const todayStart = moment().startOf("day").toDate();
      const todayEnd = moment().endOf("day").toDate();
    
      const weekStart = moment().startOf("week").toDate();
      const weekEnd = moment().endOf("week").toDate();
    
      const monthStart = moment().startOf("month").toDate();
      const monthEnd = moment().endOf("month").toDate();

      const totalContactUs = await ContactUs.count({ where: { isDeleted: false } });

      const todayContactUs = await ContactUs.count({
        where: {
          isDeleted: false,
          createdAt: {
            [Op.gte]: todayStart,
            [Op.lte]: todayEnd,
          },
        },
      });

      const weekContactUs = await ContactUs.count({
        where: {
          isDeleted: false,
          createdAt: {
            [Op.gte]: weekStart,
            [Op.lte]: weekEnd,
          },
        },
      });

      const monthContactUs = await ContactUs.count({
        where: {
          isDeleted: false,
          createdAt: {
            [Op.gte]: monthStart,
            [Op.lte]: monthEnd,
          },
        },
      });

    return {
      totalMessages: totalContactUs,
      todayMessages: todayContactUs,
      thisWeekMessages: weekContactUs,
      thisMonthMessages: monthContactUs,
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