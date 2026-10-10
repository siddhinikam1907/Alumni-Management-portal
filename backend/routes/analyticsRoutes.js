import express from "express";

import {
  getAlumniEngagement,
  getAlumniContribution,
} from "../controllers/analyticsController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Overall alumni engagement statistics
router.get(
  "/alumni-engagement",
  protect,
  authorizeRoles("ADMIN"),
  getAlumniEngagement,
);

// Detailed contribution of every alumni
router.get(
  "/alumni-contributions",
  protect,
  authorizeRoles("ADMIN"),
  getAlumniContribution,
);

export default router;
