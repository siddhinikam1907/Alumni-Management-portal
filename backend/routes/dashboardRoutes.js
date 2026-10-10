import express from "express";
import { getStudentDashboardStats } from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/student", protect, getStudentDashboardStats);

export default router;
