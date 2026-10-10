import express from "express";

import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorizeRoles("STUDENT", "ALUMNI", "ADMIN"),
  getMyNotifications,
);

router.get(
  "/unread-count",
  protect,
  authorizeRoles("STUDENT", "ALUMNI", "ADMIN"),
  getUnreadNotificationCount,
);

router.put(
  "/:id/read",
  protect,
  authorizeRoles("STUDENT", "ALUMNI", "ADMIN"),
  markNotificationAsRead,
);

router.put(
  "/read-all",
  protect,
  authorizeRoles("STUDENT", "ALUMNI", "ADMIN"),
  markAllNotificationsAsRead,
);

export default router;
