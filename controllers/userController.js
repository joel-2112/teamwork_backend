import {
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
  createAdminUserService,
  updateUserStatusService,
} from "../services/userService.js";

export const getAllUsers = async (req, res) => {
  try {
    const { page, limit, status, search } = req.query;
    const users = await getAllUsersService({ page, limit, status, search });
    res.status(200).json({
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
    res.status(200).json({
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
    res.status(200).json({
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
    res.status(200).json({
      success: true,
      message: `User with id ${req.params.id} is deleted successfully.`,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin can create an other admin
export const createAdminUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const newAdmin = await createAdminUserService({ name, email, password });
    res.status(200).json({
      success: true,
      message: "admin created successfully.",
      newAdmin: newAdmin,
    });
  } catch (error) {
    console.error("create admin error", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body
    const user = await updateUserStatusService(req.params.id, status);

    res
      .status(200)
      .json({
        success: true,
        message: `'${user.name}' has been successfully ${status}.`,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
