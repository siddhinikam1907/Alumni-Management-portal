import express from "express";

import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
} from "../controllers/adminUserController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// ADMIN - USER MANAGEMENT
// ==========================================

// Get all Students and Alumni
// GET /api/admin/users
router.get("/", protect, authorizeRoles("ADMIN"), getAllUsers);

// Get a specific Student or Alumni
// GET /api/admin/users/:id
router.get("/:id", protect, authorizeRoles("ADMIN"), getUserById);

// Update user status
// ACTIVE / INACTIVE / SUSPENDED
// PATCH /api/admin/users/:id/status
router.patch("/:id/status", protect, authorizeRoles("ADMIN"), updateUserStatus);

// Permanently delete Student/Alumni account
// DELETE /api/admin/users/:id
router.delete("/:id", protect, authorizeRoles("ADMIN"), deleteUser);

export default router;
