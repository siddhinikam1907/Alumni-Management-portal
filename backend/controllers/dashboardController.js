import Alumni from "../models/Alumni.js";
import Job from "../models/Job.js";
import Event from "../models/Event.js";
import MentorProfile from "../models/MentorProfile.js";

export const getStudentDashboardStats = async (req, res) => {
  try {
    const [alumniCount, mentorCount, jobCount, eventCount] = await Promise.all([
      Alumni.countDocuments(),
      MentorProfile.countDocuments({ available: true }),
      Job.countDocuments({ status: "OPEN" }),
      Event.countDocuments({
        date: { $gte: new Date() },
      }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        alumniCount,
        mentorCount,
        jobCount,
        eventCount,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};
