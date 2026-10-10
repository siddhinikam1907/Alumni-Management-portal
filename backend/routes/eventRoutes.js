import express from "express";

import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Anyone can view events
router.get("/", getAllEvents);

router.get("/:id", getEventById);

// Only Admin can manage events
router.post("/", protect, authorizeRoles("ADMIN"), createEvent);

router.put("/:id", protect, authorizeRoles("ADMIN"), updateEvent);

router.delete("/:id", protect, authorizeRoles("ADMIN"), deleteEvent);

export default router;
