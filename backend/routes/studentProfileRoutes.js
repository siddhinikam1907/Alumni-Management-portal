import express from "express";

import {
  getMyStudentProfile,
  updateStudentProfile,
  getStudentProfileById,
} from "../controllers/studentProfileController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, authorizeRoles("STUDENT"), getMyStudentProfile);

router.put("/me", protect, authorizeRoles("STUDENT"), updateStudentProfile);

router.get(
  "/:id",
  protect,
  authorizeRoles("STUDENT", "ALUMNI", "ADMIN"),
  getStudentProfileById,
);

export default router;
