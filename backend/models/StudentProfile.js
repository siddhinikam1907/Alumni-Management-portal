import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Personal Information
    mobileNo: {
      type: String,
      trim: true,
    },

    dob: {
      type: Date,
    },

    nativePlace: {
      type: String,
      trim: true,
    },

    currentLocation: {
      type: String,
      trim: true,
    },

    // Academic Information
    college: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    enrollmentYear: {
      type: Number,
    },

    expectedGraduationYear: {
      type: Number,
    },

    currentYear: {
      type: String,
      trim: true,
    },

    cgpa: {
      type: Number,
      min: 0,
      max: 10,
    },

    // Career Information
    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    areaOfExpertise: [
      {
        type: String,
        trim: true,
      },
    ],

    careerInterests: [
      {
        type: String,
        trim: true,
      },
    ],

    // Professional Links
    linkedinUrl: {
      type: String,
      trim: true,
    },

    githubUrl: {
      type: String,
      trim: true,
    },

    portfolioUrl: {
      type: String,
      trim: true,
    },

    // Files
    photo: {
      type: String,
      default: "",
    },

    resumeUrl: {
      type: String,
      default: "",
    },

    // Visibility
    profileVisibility: {
      alumni: {
        type: Boolean,
        default: true,
      },

      mentors: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);

export default StudentProfile;
