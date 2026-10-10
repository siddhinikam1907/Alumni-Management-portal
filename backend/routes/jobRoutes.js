import express from "express";

import {
  createJob,
  getAllJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("ALUMNI", "ADMIN"), createJob);

router.put("/:id", protect, authorizeRoles("ALUMNI", "ADMIN"), updateJob);

router.get("/", getAllJobs);

router.get("/my", protect, authorizeRoles("ALUMNI"), getMyJobs);

router.get("/:id", getJobById);

router.delete("/:id", protect, authorizeRoles("ALUMNI", "ADMIN"), deleteJob);

export default router;
