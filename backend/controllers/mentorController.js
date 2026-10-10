import mongoose from "mongoose";

import MentorProfile from "../models/MentorProfile.js";
import Alumni from "../models/Alumni.js";
import User from "../models/User.js";

// Create mentor profile
export const createMentorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || user.role !== "ALUMNI") {
      return res.status(403).json({
        success: false,
        message: "Only alumni can create mentor profiles",
      });
    }

    if (!user.alumniId) {
      return res.status(404).json({
        success: false,
        message: "Alumni profile not found",
      });
    }

    const existingProfile = await MentorProfile.findOne({
      alumni: req.user.userId,
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Mentor profile already exists",
      });
    }

    const {
      expertise,
      yearsOfExperience,
      mentorshipTopics,
      preferredMode,
      available,
      bio,
    } = req.body;

    if (!Array.isArray(expertise) || expertise.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one expertise is required",
      });
    }

    const mentorProfile = await MentorProfile.create({
      alumni: req.user.userId,
      expertise,
      yearsOfExperience,
      mentorshipTopics,
      preferredMode,
      available,
      bio,
    });

    res.status(201).json({
      success: true,
      message: "Mentor profile created successfully",
      mentorProfile,
    });
  } catch (error) {
    console.error("Create mentor profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create mentor profile",
      error: error.message,
    });
  }
};

// Get all available mentors
export const getMentors = async (req, res) => {
  try {
    const { expertise, location, preferredMode } = req.query;

    const mentorFilter = {
      available: true,
    };

    if (expertise) {
      mentorFilter.expertise = {
        $regex: expertise,
        $options: "i",
      };
    }

    if (preferredMode) {
      mentorFilter.preferredMode = preferredMode;
    }

    const mentorProfiles = await MentorProfile.find(mentorFilter)
      .populate("alumni", "name email alumniId")
      .sort({ createdAt: -1 });

    let mentors = mentorProfiles;

    // Filter by alumni location
    if (location) {
      const alumniRecords = await Alumni.find({
        currentLocation: {
          $regex: location,
          $options: "i",
        },
      }).select("_id");

      const alumniIds = alumniRecords.map((alumni) => alumni._id.toString());

      const users = await User.find({
        alumniId: { $in: alumniIds },
      }).select("_id");

      const userIds = users.map((user) => user._id.toString());

      mentors = mentorProfiles.filter((mentor) =>
        userIds.includes(mentor.alumni._id.toString()),
      );
    }

    res.status(200).json({
      success: true,
      count: mentors.length,
      mentors,
    });
  } catch (error) {
    console.error("Get mentors error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch mentors",
      error: error.message,
    });
  }
};

// Get my mentor profile
export const getMyMentorProfile = async (req, res) => {
  try {
    const mentorProfile = await MentorProfile.findOne({
      alumni: req.user.userId,
    }).populate("alumni", "name email alumniId");

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: "Mentor profile not found",
      });
    }

    res.status(200).json({
      success: true,
      mentorProfile,
    });
  } catch (error) {
    console.error("Get my mentor profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch mentor profile",
      error: error.message,
    });
  }
};

// Update my mentor profile
export const updateMentorProfile = async (req, res) => {
  try {
    const mentorProfile = await MentorProfile.findOne({
      alumni: req.user.userId,
    });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: "Mentor profile not found",
      });
    }

    const {
      expertise,
      yearsOfExperience,
      mentorshipTopics,
      preferredMode,
      available,
      bio,
    } = req.body;

    mentorProfile.expertise = expertise ?? mentorProfile.expertise;

    mentorProfile.yearsOfExperience =
      yearsOfExperience ?? mentorProfile.yearsOfExperience;

    mentorProfile.mentorshipTopics =
      mentorshipTopics ?? mentorProfile.mentorshipTopics;

    mentorProfile.preferredMode = preferredMode ?? mentorProfile.preferredMode;

    mentorProfile.available = available ?? mentorProfile.available;

    mentorProfile.bio = bio ?? mentorProfile.bio;

    await mentorProfile.save();

    res.status(200).json({
      success: true,
      message: "Mentor profile updated successfully",
      mentorProfile,
    });
  } catch (error) {
    console.error("Update mentor profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update mentor profile",
      error: error.message,
    });
  }
};
