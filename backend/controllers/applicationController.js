import mongoose from "mongoose";
import crypto from "crypto";
import path from "path";
import User from "../models/User.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import cloudinary from "../config/cloudinary.js";
import { createNotification } from "../utils/notificationHelper.js";
// Apply for a job
export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    // 1. Validate Job ID
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    // 2. Check whether job exists
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // 3. Check whether resume was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume is required",
      });
    }

    // 4. Check whether student already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.userId,
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    // 5. Generate unique file name
    const fileExtension = path
      .extname(req.file.originalname)
      .toLowerCase()
      .replace(".", "");

    const publicId = `resume-${crypto.randomUUID()}`;

    // 6. Upload resume to Cloudinary
    const uploadResumeToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "alumni-portal/resumes",
            public_id: publicId,
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload failed:", error);

              reject(error);
            } else {
              resolve(result);
            }
          },
        );

        uploadStream.end(req.file.buffer);
      });
    };

    const cloudinaryResult = await uploadResumeToCloudinary();

    // 7. Create application in MongoDB
    const application = await Application.create({
      job: jobId,

      applicant: req.user.userId,

      resume: {
        fileName: req.file.originalname,
        fileUrl: cloudinaryResult.secure_url,
      },

      coverLetter: coverLetter || "",

      status: "APPLIED",
    });
    const applicant = await User.findById(req.user.userId);

    await createNotification({
      recipient: job.postedBy,
      type: "JOB_APPLICATION",
      title: "New Job Application",
      message: `${applicant.name} has applied for your job: ${job.title}.`,
      relatedId: application._id,
    });
    // 8. Send response
    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("FULL APPLICATION ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit application",
      error: error.message,
    });
  }
};
// Get applications submitted by logged-in student
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      applicant: req.user.userId,
    })
      .populate("job", "title companyName location jobType skills")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get my applications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};
// Get applicants for a particular job
export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if job exists
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Alumni can only view applications for their own job
    if (
      req.user.role === "ALUMNI" &&
      job.postedBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only view applications for your own jobs",
      });
    }

    const applications = await Application.find({
      job: jobId,
    })
      .populate("applicant", "name email role")
      .populate("job", "title companyName location jobType")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get job applications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch job applications",
      error: error.message,
    });
  }
};
// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["APPLIED", "SHORTLISTED", "REJECTED", "SELECTED"];

    // Validate status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    // Find application
    const application = await Application.findById(id).populate(
      "job",
      "title companyName postedBy",
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Alumni can only update applications for their own jobs
    if (
      req.user.role === "ALUMNI" &&
      application.job.postedBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update applications for your own jobs",
      });
    }

    application.status = status;

    await application.save();

    await createNotification({
      recipient: application.applicant,
      type: "APPLICATION_STATUS",
      title: "Application Status Updated",
      message: `Your application status for "${application.job.title}" has been updated to ${status}.`,
      relatedId: application._id,
    });
    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error("Update application status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update application status",
      error: error.message,
    });
  }
};
