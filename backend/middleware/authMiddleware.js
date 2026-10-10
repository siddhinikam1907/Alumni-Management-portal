import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Check whether token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get the latest user information from database
    const user = await User.findById(decoded.userId).select(
      "_id name email role status alumniId",
    );

    // User no longer exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists",
      });
    }

    // Check current account status
    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message:
          user.status === "SUSPENDED"
            ? "Your account has been suspended. Please contact the administrator."
            : "Your account is inactive. Please contact the administrator.",
      });
    }

    // Store CURRENT user information in request
    req.user = {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      alumniId: user.alumniId,
    };

    // Continue to the next middleware/controller
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action",
      });
    }

    next();
  };
};
