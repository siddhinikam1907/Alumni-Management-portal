import MentorRequest from "../models/MentorRequest.js";
import MentorProfile from "../models/MentorProfile.js";
import User from "../models/User.js";
import { createNotification } from "../utils/notificationHelper.js";
// Send mentor request
export const sendMentorRequest = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { mentorId, message } = req.body;

    // Check message
    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Check mentor
    const mentor = await User.findById(mentorId);

    if (!mentor || mentor.role !== "ALUMNI") {
      return res.status(404).json({
        success: false,
        message: "Mentor not found",
      });
    }

    // Student cannot request themselves
    if (studentId === mentorId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a mentor request to yourself",
      });
    }

    // Check mentor profile
    const mentorProfile = await MentorProfile.findOne({
      alumni: mentorId,
    });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: "Mentor profile not found",
      });
    }

    // Check mentor availability
    if (!mentorProfile.available) {
      return res.status(400).json({
        success: false,
        message: "This mentor is currently unavailable",
      });
    }

    // Check duplicate request
    const existingRequest = await MentorRequest.findOne({
      mentor: mentorId,
      student: studentId,
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "Mentor request already exists",
      });
    }

    // Create request
    const mentorRequest = await MentorRequest.create({
      mentor: mentorId,
      student: studentId,
      message: message.trim(),
    });
    const student = await User.findById(studentId);

    await createNotification({
      recipient: mentorId,
      type: "MENTOR_REQUEST",
      title: "New Mentor Request",
      message: `${student.name} has sent you a mentor request.`,
      relatedId: mentorRequest._id,
    });
    res.status(201).json({
      success: true,
      message: "Mentor request sent successfully",
      mentorRequest,
    });
  } catch (error) {
    console.error("Send mentor request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send mentor request",
      error: error.message,
    });
  }
};

// Get requests sent by the student
export const getMyMentorRequests = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const requests = await MentorRequest.find({
      student: studentId,
    })
      .populate("mentor", "name email alumniId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get my mentor requests error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch mentor requests",
      error: error.message,
    });
  }
};

// Get requests received by the mentor
export const getReceivedMentorRequests = async (req, res) => {
  try {
    const mentorId = req.user.userId;

    const requests = await MentorRequest.find({
      mentor: mentorId,
    })
      .populate("student", "name email alumniId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get received mentor requests error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch received mentor requests",
      error: error.message,
    });
  }
};

// Accept or reject mentor request
export const updateMentorRequestStatus = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be ACCEPTED or REJECTED",
      });
    }

    // Find request
    const mentorRequest = await MentorRequest.findById(id);

    if (!mentorRequest) {
      return res.status(404).json({
        success: false,
        message: "Mentor request not found",
      });
    }

    // Only the mentor who received the request can update it
    if (mentorRequest.mentor.toString() !== mentorId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this request",
      });
    }

    // Prevent changing an already processed request
    if (mentorRequest.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "This mentor request has already been processed",
      });
    }

    mentorRequest.status = status;

    await mentorRequest.save();
    const mentor = await User.findById(mentorId);

    await createNotification({
      recipient: mentorRequest.student,
      type: "MENTOR_REQUEST_STATUS",
      title: `Mentor Request ${status === "ACCEPTED" ? "Accepted" : "Rejected"}`,
      message: `${mentor.name} has ${status === "ACCEPTED" ? "accepted" : "rejected"} your mentor request.`,
      relatedId: mentorRequest._id,
    });

    res.status(200).json({
      success: true,
      message: `Mentor request ${status.toLowerCase()} successfully`,
      mentorRequest,
    });
  } catch (error) {
    console.error("Update mentor request status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update mentor request",
      error: error.message,
    });
  }
};
