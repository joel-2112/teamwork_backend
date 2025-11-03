import {
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
  createAdminUserService,
  updateUserStatusService,
  userStatisticsService,
  changePasswordService,
  sendPasswordResetOtpService,
  verifyPasswordResetOtpService,
  resetPasswordService,
  updateProfileService,
  getUserByEmailService,
} from "../services/userService.js";
import bcrypt from "bcryptjs";
export const checkUserExistence = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user by email
    const user = await getUserByEmailService(email);

    // If user not found
    if (!user) {
      return res.status(200).json({
        success: false,
        exists: false,
        message: "User does not exist.",
      });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(200).json({
        success: false,
        exists: true,
        message: "Incorrect password.",
      });
    }

    // If both email and password are valid
    return res.status(200).json({
      success: true,
      exists: true,
      message: "User authenticated successfully.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error checking user existence:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    const { page, limit, status, search, roleId } = req.query;
    const users = await getAllUsersService({
      page,
      limit,
      status,
      search,
      roleId,
    });
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
    const userId = req.params.id;
    await deleteUserService(userId, req.user);
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
    const newAdmin = await createAdminUserService(req.body);

    res.status(200).json({
      success: true,
      message: "Admin created successfully.",
      newAdmin,
    });
  } catch (error) {
    console.error("create admin error", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await updateUserStatusService(req.params.id, status);

    res.status(200).json({
      success: true,
      message: `'${user.name}' has been successfully ${status}.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const updatedUser = await changePasswordService(req.user, req.body);
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    let updatedData = { ...req.body };

    if (req.file && req.file.path) {
      updatedData.profilePicture = `${req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`;
    }

    const agent = await updateProfileService(user, updatedData);

    res.status(200).json(agent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



// Step 1: Send OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await sendPasswordResetOtpService(email);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Step 2: Verify OTP
export const verifyPasswordResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyPasswordResetOtpService(email, otp);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Step 3: Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmNewPassword } = req.body;
    const result = await resetPasswordService(email, newPassword, confirmNewPassword);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const userStatistics = async (req, res) => {
  try {
    const stats = await userStatisticsService(req.user);
    res.status(200).json({
      success: true,
      message: "User statistics is successfully sent.",
      userData: stats,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
