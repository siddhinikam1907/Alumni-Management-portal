import express from "express";

import {
  sendMentorRequest,
  getMyMentorRequests,
  getReceivedMentorRequests,
  updateMentorRequestStatus,
} from "../controllers/mentorRequestController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Student sends a mentor request
router.post("/", protect, authorizeRoles("STUDENT"), sendMentorRequest);

// Student gets requests they have sent
router.get("/my", protect, authorizeRoles("STUDENT"), getMyMentorRequests);

// Alumni gets requests they have received
router.get(
  "/received",
  protect,
  authorizeRoles("ALUMNI"),
  getReceivedMentorRequests,
);

// Alumni accepts/rejects a mentor request
router.put(
  "/:id/status",
  protect,
  authorizeRoles("ALUMNI"),
  updateMentorRequestStatus,
);

export default router;
