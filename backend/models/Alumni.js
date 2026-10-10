import mongoose from "mongoose";

const alumniSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    passoutYear: {
      type: Number,
      required: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    nativePlace: {
      type: String,
      required: true,
      trim: true,
    },

    currentLocation: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    previousCompanies: {
      type: [String],
      default: [],
    },

    areaOfExpertise: {
      type: [String],
      default: [],
    },

    linkedinUrl: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    mobileNo: {
      type: String,
      required: true,
      unique: true,
    },

    photo: {
      type: String,
      default: "",
    },

    dob: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Alumni", alumniSchema);
