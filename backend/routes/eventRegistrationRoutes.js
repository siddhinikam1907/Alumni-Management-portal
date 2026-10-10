import express from "express";
import {
  registerForEvent,
  getMyEventRegistrations,
  getEventParticipants,
} from "../controllers/eventRegistrationController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Student / Alumni register
router.post(
  "/:eventId",
  protect,
  authorizeRoles("STUDENT", "ALUMNI"),
  registerForEvent,
);

// Student / Alumni view their registrations
router.get(
  "/my",
  protect,
  authorizeRoles("STUDENT", "ALUMNI"),
  getMyEventRegistrations,
);

// Admin views participants
router.get(
  "/event/:eventId",
  protect,
  authorizeRoles("ADMIN"),
  getEventParticipants,
);

export default router;
