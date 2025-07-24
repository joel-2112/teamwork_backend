import {
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
} from "../services/userService.js";

export const getAllUsers = async (req, res) => {
  try {
    const { page, limit, name } = req.query;
    const users = await getAllUsersService({ page, limit, name });
    res
      .status(200)
      .json({
        success: true,
        message: "All user successfully retrieved.",
        users: users,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await getUserByIdService(req.params.id);
    res
      .status(200)
      .json({
        success: true,
        message: `User with id ${req.params.id} is:`,
        user: user,
      });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await updateUserService(req.params.id, req.body);
    res
      .status(200)
      .json({
        success: true,
        message: `User with id ${req.params.id} is: `,
        user: user,
      });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await deleteUserService(req.params.id);
    res
      .status(200)
      .json({
        success: true,
        message: `User with id ${req.params.id} is deleted successfully.`,
      });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
