import express from "express";
import {
  getAllAlumni,
  getAlumniById,
  getMyAlumniProfile,
  updateMyAlumniProfile,
} from "../controllers/alumniController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", getAllAlumni);
router.get("/:id", getAlumniById);
router.get("/profile/me", protect, getMyAlumniProfile);
router.put("/profile/me", protect, updateMyAlumniProfile);
export default router;
