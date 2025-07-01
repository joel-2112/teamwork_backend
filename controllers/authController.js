import {
  loginService,
  refreshTokenService,
  logoutService,
  sendOtpService,
  verifyOtpService,
  createAdminUserService,
  checkAuthService,
} from "../services/authService.js";

export const sendOtp = async (req, res) => {
  try {
    // Now expects name, email, password
    const { name, email, password } = req.body;
    const result = await sendOtpService({ name, email, password });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Send OTP error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// verify otp controller
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyOtpService(email, otp);
    res.status(200).json({ success: true,  ...result });
  } catch (error) {
    console.error("OTP verification error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log("Login request body:", req.body);
    const result = await loginService(req.body);
    res
      .status(200)
      .json({ 
        success: true, 
        message: "login successfully.", 
        ...result 
      });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(401).json({ success: false, message: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new Error("Refresh token is required");
    const result = await refreshTokenService(refreshToken);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.log({ message: "refresh token error", error });
    res.status(401).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new Error("Refresh token is required");
    await logoutService(refreshToken);
    res.status(204).json({ success: true, message: "logout successfully." });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

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

export const checkAuth = async (req, res) => {
  try {
    const result = await checkAuthService(req.user.email);

    res.status(200).json({
      success: true,
      message: "Authenticated user",
      ...result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || "Authentication failed",
    });
  }
};
