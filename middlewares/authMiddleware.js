import jwt from "jsonwebtoken";
import db from "../models/index.js";
const { User, Role } = db;

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      const error = new Error("Not authorized, no token provided");
      error.status = 401;
      throw error;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request object
    const user  = await User.findByPk(decoded.userId, {
      attributes: ["id", "name", "email", "roleId"],
      include: [{ model: Role, as: "Role" }],
    });
    req.user = user;

    if (!req.user) {
      const error = new Error("Not authorized, user not found");
      error.status = 401;
      throw error;
    }

    next();
  } catch (err) {
    console.error("Authorization error:", err.message);

    res.status(401).json({
      success: false,
      error: err.message || "Unauthorized access",
    });
  }
};

// Check user role to access protected route
// export const requireRole = (roleName) => {
//   return async (req, res, next) => {
//     if (!req.user || !req.user.Role || req.user.Role.name !== roleName) {
//       return res.status(403).json({
//         success: false,
//         error: `Requires ${roleName} role`,
//       });
//     }

//     next();
//   };
// };

// Check user role to access protected route
export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    const userRole = req.user?.Role?.name;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires one of: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};
