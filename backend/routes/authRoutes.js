import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  adminTest,
  changePassword,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/admin-test", protect, authorizeRoles("ADMIN"), adminTest);
router.put("/change-password", protect, changePassword);

router.get("/notification-preferences", protect, getNotificationPreferences);

router.put("/notification-preferences", protect, updateNotificationPreferences);

export default router;
