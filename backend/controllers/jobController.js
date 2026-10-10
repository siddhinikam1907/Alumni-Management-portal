import Job from "../models/Job.js";
import mongoose from "mongoose";
export const createJob = async (req, res) => {
  try {
    const {
      title,
      companyName,
      description,
      location,
      jobType,
      skills,
      experience,
      salary,
      applicationLink,
    } = req.body;

    // Create the job
    const job = await Job.create({
      title,
      companyName,
      description,
      location,
      jobType,
      skills,
      experience,
      salary,
      applicationLink,

      // Get the logged-in user's ID from JWT
      postedBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to post job",
      error: error.message,
    });
  }
};
export const getAllJobs = async (req, res) => {
  try {
    const { title, companyName, location, jobType, skills, search } = req.query;

    const filter = {};

    if (title) {
      filter.title = {
        $regex: title,
        $options: "i",
      };
    }

    if (companyName) {
      filter.companyName = {
        $regex: companyName,
        $options: "i",
      };
    }

    if (location) {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

    if (jobType) {
      filter.jobType = jobType;
    }

    if (skills) {
      filter.skills = {
        $regex: skills,
        $options: "i",
      };
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          companyName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          location: {
            $regex: search,
            $options: "i",
          },
        },
        {
          skills: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const jobs = await Job.find(filter)
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalJobs: jobs.length,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
      error: error.message,
    });
  }
};
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      postedBy: req.user.userId,
    })
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalJobs: jobs.length,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch your jobs",
      error: error.message,
    });
  }
};
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check whether the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(id).populate("postedBy", "name email");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch job",
      error: error.message,
    });
  }
};
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Alumni can update only their own job
    if (
      req.user.role === "ALUMNI" &&
      job.postedBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own jobs",
      });
    }

    const allowedFields = [
      "title",
      "companyName",
      "description",
      "location",
      "jobType",
      "skills",
      "experience",
      "salary",
      "applicationLink",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedJob = await Job.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("postedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update job",
      error: error.message,
    });
  }
};
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Alumni can delete only their own job
    if (
      req.user.role === "ALUMNI" &&
      job.postedBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own jobs",
      });
    }

    await Job.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: error.message,
    });
  }
};
