import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC USER INFORMATION
    // ==========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // ==========================================
    // USER ROLE
    // ==========================================

    role: {
      type: String,
      enum: ["STUDENT", "ALUMNI", "ADMIN"],
      default: "STUDENT",
    },

    // ==========================================
    // ACCOUNT STATUS
    // ==========================================

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },

    // ==========================================
    // ALUMNI PROFILE REFERENCE
    // ==========================================

    alumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alumni",
      default: null,
    },

    // ==========================================
    // NOTIFICATION PREFERENCES
    // ==========================================

    notificationPreferences: {
      jobs: {
        type: Boolean,
        default: true,
      },

      mentorship: {
        type: Boolean,
        default: true,
      },

      events: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
