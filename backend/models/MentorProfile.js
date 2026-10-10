import mongoose from "mongoose";

const mentorProfileSchema = new mongoose.Schema(
  {
    alumni: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    expertise: {
      type: [String],
      required: true,
    },

    yearsOfExperience: {
      type: Number,
      required: true,
      min: 0,
    },

    mentorshipTopics: {
      type: [String],
      default: [],
    },

    preferredMode: {
      type: String,
      enum: ["ONLINE", "OFFLINE", "BOTH"],
      default: "ONLINE",
    },

    available: {
      type: Boolean,
      default: true,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const MentorProfile = mongoose.model("MentorProfile", mentorProfileSchema);

export default MentorProfile;
