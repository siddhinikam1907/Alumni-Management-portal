import User from "../models/User.js";
import Alumni from "../models/Alumni.js";
import Job from "../models/Job.js";
import MentorProfile from "../models/MentorProfile.js";
import MentorRequest from "../models/MentorRequest.js";
import EventRegistration from "../models/EventRegistration.js";

// ============================================================
// Get overall alumni engagement statistics
// ============================================================

export const getAlumniEngagement = async (req, res) => {
  try {
    const [
      totalAlumni,
      registeredAlumni,
      totalJobsPosted,
      totalMentors,
      totalMentorRequests,
      acceptedMentorRequests,
      totalEventRegistrations,
    ] = await Promise.all([
      // Entire alumni directory
      Alumni.countDocuments(),

      // Alumni who have created portal accounts
      User.countDocuments({
        role: "ALUMNI",
      }),

      // Total jobs posted
      Job.countDocuments(),

      // Alumni currently available as mentors
      MentorProfile.countDocuments({
        available: true,
      }),

      // Total mentorship requests
      MentorRequest.countDocuments(),

      // Accepted mentorship requests
      MentorRequest.countDocuments({
        status: "ACCEPTED",
      }),

      // Total event registrations
      EventRegistration.countDocuments(),
    ]);

    res.status(200).json({
      success: true,

      engagement: {
        totalAlumni,
        registeredAlumni,
        totalJobsPosted,
        totalMentors,
        totalMentorRequests,
        acceptedMentorRequests,
        totalEventRegistrations,
      },
    });
  } catch (error) {
    console.error("Get alumni engagement error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch alumni engagement statistics",
      error: error.message,
    });
  }
};

// ============================================================
// Get contribution details of registered alumni
// ============================================================

export const getAlumniContribution = async (req, res) => {
  try {
    const contributions = await User.aggregate([
      // Only registered alumni
      {
        $match: {
          role: "ALUMNI",
        },
      },

      // Jobs posted by the alumni
      {
        $lookup: {
          from: "jobs",
          localField: "_id",
          foreignField: "postedBy",
          as: "jobs",
        },
      },

      // Mentor profile of the alumni
      {
        $lookup: {
          from: "mentorprofiles",
          localField: "_id",
          foreignField: "alumni",
          as: "mentorProfile",
        },
      },

      // Mentorship requests received by the alumni
      {
        $lookup: {
          from: "mentorrequests",
          localField: "_id",
          foreignField: "mentor",
          as: "mentorRequests",
        },
      },

      // Events registered by the alumni
      {
        $lookup: {
          from: "eventregistrations",
          localField: "_id",
          foreignField: "user",
          as: "eventRegistrations",
        },
      },

      // Select required information
      {
        $project: {
          _id: 0,

          alumni: {
            id: "$_id",
            name: "$name",
            email: "$email",
            alumniId: "$alumniId",
          },

          contributions: {
            jobsPosted: {
              $size: "$jobs",
            },

            mentor: {
              $gt: [
                {
                  $size: "$mentorProfile",
                },
                0,
              ],
            },

            mentorshipRequestsReceived: {
              $size: "$mentorRequests",
            },

            mentorshipRequestsAccepted: {
              $size: {
                $filter: {
                  input: "$mentorRequests",
                  as: "request",
                  cond: {
                    $eq: ["$$request.status", "ACCEPTED"],
                  },
                },
              },
            },

            eventRegistrations: {
              $size: "$eventRegistrations",
            },
          },
        },
      },

      // Calculate internal contribution count
      // Used only for ordering.
      {
        $addFields: {
          contributionCount: {
            $add: [
              "$contributions.jobsPosted",

              {
                $cond: ["$contributions.mentor", 1, 0],
              },

              "$contributions.mentorshipRequestsAccepted",

              "$contributions.eventRegistrations",
            ],
          },
        },
      },

      // Show most active registered alumni first
      {
        $sort: {
          contributionCount: -1,
        },
      },

      // Remove internal contribution count
      {
        $project: {
          alumni: 1,
          contributions: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: contributions.length,
      contributions,
    });
  } catch (error) {
    console.error("Get alumni contribution error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch alumni contribution data",
      error: error.message,
    });
  }
};
