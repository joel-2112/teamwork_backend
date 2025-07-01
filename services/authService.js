import jwt from "jsonwebtoken";
import db from "../models/index.js";
import { generateToken } from "../utils/generateToken.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendOtpEMail } from "../utils/sendOTP.js";
import redisClient from "../config/redisClient.js";
import dotenv from "dotenv";
const { User, RefreshToken, Role } = db;
dotenv.config();

export const sendOtpService = async ({ name, email, password }) => {
  if (!email) throw new Error("Email is required");
  if (!password) throw new Error("Password is required");
  if (!name) throw new Error("Name is required");

  // Check if user already exists in DB
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw new Error("Email already exists");

  // Generate OTP
  const otp = generateOtp();

  // Store OTP in Redis (expires in 5 mins)
  await redisClient.set(`otp:${email}`, otp, { EX: 300 });
  console.log(`Stored OTP for ${email}: ${otp}`);

  // Store the user data temporarily in Redis (also expire in 5 mins)
  const tempUserData = JSON.stringify({ name, email, password });
  await redisClient.set(`pendingUser:${email}`, tempUserData, { EX: 1200 });

  // Send OTP email
  await sendOtpEMail(otp, email);

  return { message: "OTP sent to your email." };
};

export const verifyOtpService = async (email, inputOtp) => {
  const storedOtp = await redisClient.get(`otp:${email}`);
  console.log("Stored OTP:", storedOtp, "Input OTP:", inputOtp);

  if (!storedOtp) throw new Error("OTP expired or not found");
  if (storedOtp !== inputOtp) throw new Error("Invalid OTP");

  await redisClient.del(`otp:${email}`);

  const tempUserData = await redisClient.get(`pendingUser:${email}`);
  if (!tempUserData)
    throw new Error("User data expired. Please sign up again.");

  const { name, password } = JSON.parse(tempUserData);

  // Get the "user" role ID
  const defaultRole = await db.Role.findOne({ where: { name: "user" } });
  if (!defaultRole) throw new Error("Default role 'user' not found.");

  // Create user with roleId
  const user = await db.User.create({
    name,
    email,
    password,
    roleId: defaultRole.id,
  });

  await redisClient.del(`pendingUser:${email}`);

  return {
    message: "OTP verified successfully. User registered.",
    user: { id: user.id, name: user.name, email: user.email },
  };
};

// log in service
export const loginService = async ({ email, password }) => {
  if (!email) throw new Error("Missing required field: email");
  if (!password) throw new Error("Missing required field: password");

  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("Invalid email or password");

  const isValid = await user.validatePassword(password);
  if (!isValid) throw new Error("Invalid email or password");

  const accessToken = generateToken({ userId: user.id });
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  await RefreshToken.create({ token: refreshToken, userId: user.id });

  return {
    user: { id: user.id, name: user.name, email: user.email },
    accessToken,
    refreshToken,
  };
};

export const refreshTokenService = async (refreshToken) => {
  if (!refreshToken) throw new Error("Refresh token is required");

  const token = await RefreshToken.findOne({ where: { token: refreshToken } });
  if (!token) throw new Error("Invalid refresh token");

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateToken({ userId: payload.userId });
    return { accessToken };
  } catch (err) {
    throw new Error("Invalid refresh token");
  }
};

export const logoutService = async (refreshToken) => {
  if (!refreshToken) throw new Error("Refresh token is required");
  await RefreshToken.destroy({ where: { token: refreshToken } });
};

export const createAdminUserService = async ({ name, email, password }) => {
  try {
    const adminRole = await db.Role.findOne({ where: { name: "admin" } });
    if (!adminRole) throw new Error("Admin role not found");

    const existingUser = await db.User.findOne({ where: { email } });

    if (existingUser) {
      // Update their role to admin and save
      existingUser.roleId = adminRole.id;
      await existingUser.save();
      return existingUser;
    }

    // Create a new admin user
    const newUser = await db.User.create({
      name,
      email,
      password,
      roleId: adminRole.id
    });

    return newUser;

  } catch (err) {
    throw new Error("Failed to create or update admin.");
  }
};
