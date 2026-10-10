import mongoose from "mongoose";

const mentorRequestSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  },
);

mentorRequestSchema.index({ mentor: 1, student: 1 }, { unique: true });

const MentorRequest = mongoose.model("MentorRequest", mentorRequestSchema);

export default MentorRequest;
