import express from "express";

import {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} from "../controllers/applicationController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Student applies for a job
router.post(
  "/:jobId",
  protect,
  authorizeRoles("STUDENT"),
  upload.single("resume"),
  applyForJob,
);
router.get("/my", protect, authorizeRoles("STUDENT"), getMyApplications);
router.get(
  "/job/:jobId",
  protect,
  authorizeRoles("ALUMNI", "ADMIN"),
  getJobApplications,
);
router.put(
  "/:id/status",
  protect,
  authorizeRoles("ALUMNI", "ADMIN"),
  updateApplicationStatus,
);

export default router;
