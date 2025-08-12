import jwt from "jsonwebtoken";
import db from "../models/index.js";
const { User, Role, Region, Zone, Woreda } = db;

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
    const user = await User.findByPk(decoded.userId, {
      attributes: [
        "id",
        "name",
        "email",
        "roleId",
        "regionId",
        "zoneId",
        "woredaId",
      ],
      include: [
        { model: Role, as: "Role" },
        { model: Region, attributes: ["id", "name"] },
        { model: Zone, attributes: ["id", "name"] },
        { model: Woreda, attributes: ["id", "name"] },
      ],
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




export const socketProtect = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token; // Extract token from the handshake

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId); // Ensure User model is imported

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    socket.userId = user.id; // Attach user ID to the socket
    socket.username = user.name; // Optionally attach username or other data
    next();
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    next(new Error("Authentication error: " + error.message));
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
  const roles = allowedRoles.flat(); // this flattens the input to a single array

  return async (req, res, next) => {
    const userRole = req.user?.Role?.name;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires one of: ${roles.join(", ")}`,
      });
    }

    next();
  };
};
