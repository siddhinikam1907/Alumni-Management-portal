import express from "express";

import {
  createMentorProfile,
  getMentors,
  getMyMentorProfile,
  updateMentorProfile,
} from "../controllers/mentorController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all available mentors
router.get("/", getMentors);

// Create mentor profile - Alumni only
router.post("/", protect, authorizeRoles("ALUMNI"), createMentorProfile);

// Get my mentor profile - Alumni only
router.get("/my", protect, authorizeRoles("ALUMNI"), getMyMentorProfile);

// Update my mentor profile - Alumni only
router.put("/my", protect, authorizeRoles("ALUMNI"), updateMentorProfile);

export default router;
