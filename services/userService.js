// services/userService.js
const { Op } = require('sequelize');
const { User } = require('../models');

const getAllUsersService = async ({ page = 1, limit = 10, name } = {}) => {
  const offset = (page - 1) * limit;
  const where = {};
  if (name) where.name = { [Op.iLike]: `%${name}%` };

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    users: rows,
  };
};

const getUserByIdService = async (id) => {
  const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
  if (!user) throw new Error('User not found');
  return user;
};

const updateUserService = async (id, data) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error('User not found');
  if (data.email && data.email !== user.email) {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) throw new Error('Email already exists');
  }
  return await user.update(data);
};

const deleteUserService = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error('User not found');
  return await user.destroy();
};

module.exports = {
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
};