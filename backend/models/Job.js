import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    jobType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "INTERNSHIP"],
      required: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    experience: {
      type: String,
      default: "Fresher",
      trim: true,
    },

    salary: {
      min: {
        type: Number,
        default: null,
      },

      max: {
        type: Number,
        default: null,
      },

      currency: {
        type: String,
        default: "INR",
      },

      period: {
        type: String,
        enum: ["YEARLY", "MONTHLY", "HOURLY"],
        default: "YEARLY",
      },
    },

    applicationLink: {
      type: String,
      default: "",
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
