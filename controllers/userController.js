// controllers/userController.js
const {
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
} = require('../services/userService');

const getAllUsers = async (req, res) => {
  try {
    const { page, limit, name } = req.query;
    const users = await getAllUsersService({ page, limit, name });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await getUserByIdService(req.params.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await updateUserService(req.params.id, req.body);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await deleteUserService(req.params.id);
    res.status(204).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};