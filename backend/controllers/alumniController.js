import Alumni from "../models/Alumni.js";
import User from "../models/User.js";
export const getAllAlumni = async (req, res) => {
  try {
    // -----------------------------
    // 1. Pagination
    // -----------------------------

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    // -----------------------------
    // 2. Get filters
    // -----------------------------

    const {
      department,
      passoutYear,
      currentLocation,
      nativePlace,
      companyName,
      previousCompanies,
      areaOfExpertise,
      search,
    } = req.query;

    // -----------------------------
    // 3. Build MongoDB filter
    // -----------------------------

    const filter = {};

    if (department) {
      filter.department = department;
    }

    if (passoutYear) {
      filter.passoutYear = parseInt(passoutYear);
    }

    if (currentLocation) {
      filter.currentLocation = currentLocation;
    }

    if (nativePlace) {
      filter.nativePlace = nativePlace;
    }

    if (companyName) {
      filter.companyName = companyName;
    }

    if (previousCompanies) {
      filter.previousCompanies = previousCompanies;
    }

    if (areaOfExpertise) {
      filter.areaOfExpertise = areaOfExpertise;
    }

    // -----------------------------
    // 4. General search
    // -----------------------------

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { currentLocation: { $regex: search, $options: "i" } },
        { nativePlace: { $regex: search, $options: "i" } },
        { areaOfExpertise: { $regex: search, $options: "i" } },
        { previousCompanies: { $regex: search, $options: "i" } },
      ];
    }

    // -----------------------------
    // 5. Fetch alumni
    // -----------------------------

    const alumni = await Alumni.find(filter).skip(skip).limit(limit);

    // -----------------------------
    // 6. Count matching records
    // -----------------------------

    const totalAlumni = await Alumni.countDocuments(filter);

    // -----------------------------
    // 7. Send response
    // -----------------------------

    res.status(200).json({
      success: true,
      page,
      limit,
      totalAlumni,
      totalPages: Math.ceil(totalAlumni / limit),
      alumni,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch alumni",
      error: error.message,
    });
  }
};
export const getAlumniById = async (req, res) => {
  try {
    const { id } = req.params;

    const alumni = await Alumni.findById(id);

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: "Alumni not found",
      });
    }

    res.status(200).json({
      success: true,
      alumni,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch alumni",
      error: error.message,
    });
  }
};
export const getMyAlumniProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.alumniId) {
      return res.status(404).json({
        success: false,
        message: "Alumni profile not linked to this account",
      });
    }

    const alumni = await Alumni.findById(user.alumniId);

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: "Alumni profile not found",
      });
    }

    res.status(200).json({
      success: true,
      alumni,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch alumni profile",
      error: error.message,
    });
  }
};
export const updateMyAlumniProfile = async (req, res) => {
  try {
    // Find logged-in user
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Make sure the account is linked to an Alumni profile
    if (!user.alumniId) {
      return res.status(404).json({
        success: false,
        message: "Alumni profile not linked to this account",
      });
    }

    // Fields that are allowed to be updated
    const allowedFields = [
      "name",
      "nativePlace",
      "currentLocation",
      "companyName",
      "previousCompanies",
      "areaOfExpertise",
      "linkedinUrl",
      "mobileNo",
      "photo",
      "dob",
    ];

    // Build update object
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Update Alumni profile
    const alumni = await Alumni.findByIdAndUpdate(user.alumniId, updates, {
      new: true,
      runValidators: true,
    });

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: "Alumni profile not found",
      });
    }

    // Keep User name synchronized with Alumni name
    if (updates.name) {
      user.name = updates.name;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Alumni profile updated successfully",
      alumni,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update alumni profile",
      error: error.message,
    });
  }
};
