import jwt from "jsonwebtoken";
import db from "../models/index.js";
import { generateToken } from "../utils/generateToken.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendOtpEMail } from "../utils/sendOTP.js";
import redisClient from "../config/redisClient.js";
import dotenv from "dotenv";
const { User, RefreshToken, Role, Partnership, Agent } = db;
dotenv.config();

// Services to send the otp via user email
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

  return { message: "OTP sent to your email.", email };
};

// Service to verify the otp and register new user if the otp is valid
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
  const defaultRole = await Role.findOne({ where: { name: "user" } });
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
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: defaultRole.name,
    },
  };
};

// Service to log in the user
export const loginService = async ({ email, password }) => {
  if (!email) throw new Error("Missing required field: email");
  if (!password) throw new Error("Missing required field: password");

  // Fetch user and include their role
  const user = await User.findOne({
    where: { email },
    include: [{ model: Role, attributes: ["name"] }],
  });
  if (!user) throw new Error("Invalid email or password");

  if (user.status === "blocked")
    throw new Error("You have been blocked, so you can not login.");

  const isValid = await user.validatePassword(password);
  if (!isValid) throw new Error("Invalid email or password");

  // Generate tokens
  const accessToken = generateToken({ userId: user.id });
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // Save refresh token (optional)
  await RefreshToken.create({ token: refreshToken, userId: user.id });

  return {
    message: "Login successful",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.Role.name, // <-- Include role name here
    },
    accessToken,
    refreshToken,
  };
};

// Service to refresh the expired access token
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

// Service to log out the user
export const logoutService = async (refreshToken) => {
  if (!refreshToken) throw new Error("Refresh token is required");
  await RefreshToken.destroy({ where: { token: refreshToken } });
};

// service to check the authentication of the user
export const checkAuthService = async (email) => {
  const user = await User.findOne({
    where: { email },
    include: [{ model: Role, attributes: ["name"] }],
  });

  if (!user) throw new Error("User not found");

  const accessToken = generateToken({ userId: user.id });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.Role.name,
    },
    accessToken,
  };
};
