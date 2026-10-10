import mongoose from "mongoose";
import User from "../models/User.js";
import Alumni from "../models/Alumni.js";

// ==========================================
// GET ALL USERS
// Admin can view Students and Alumni
// ==========================================

export const getAllUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;

    // -----------------------------------
    // Build User query
    // -----------------------------------

    const query = {
      role: { $in: ["STUDENT", "ALUMNI"] },
    };

    // Filter by role
    if (role && ["STUDENT", "ALUMNI"].includes(role)) {
      query.role = role;
    }

    // Filter by status
    if (status && ["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) {
      query.status = status;
    }

    // Search by name/email
    if (search?.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    // -----------------------------------
    // Pagination
    // -----------------------------------

    const currentPage = Math.max(Number(page) || 1, 1);

    const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (currentPage - 1) * perPage;

    // -----------------------------------
    // Fetch users
    // -----------------------------------

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select("-password")
        .populate(
          "alumniId",
          "name passoutYear department nativePlace currentLocation companyName previousCompanies areaOfExpertise linkedinUrl mobileNo photo dob",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage),

      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalUsers / perPage);

    // -----------------------------------
    // Response
    // -----------------------------------

    res.status(200).json({
      success: true,
      users,
      pagination: {
        totalUsers,
        totalPages,
        currentPage,
        limit: perPage,
      },
    });
  } catch (error) {
    console.error("Get admin users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// ==========================================
// GET USER BY ID
// ==========================================

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findOne({
      _id: id,
      role: { $in: ["STUDENT", "ALUMNI"] },
    })
      .select("-password")
      .populate(
        "alumniId",
        "name passoutYear department nativePlace currentLocation companyName previousCompanies areaOfExpertise linkedinUrl mobileNo photo dob",
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student or alumni user not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get admin user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE USER STATUS
// ACTIVE / INACTIVE / SUSPENDED
// ==========================================

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Validate status
    if (!["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values are ACTIVE, INACTIVE and SUSPENDED",
      });
    }

    // Find only Student/Alumni
    const user = await User.findOne({
      _id: id,
      role: { $in: ["STUDENT", "ALUMNI"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student or alumni user not found",
      });
    }

    // Prevent unnecessary update
    if (user.status === status) {
      return res.status(200).json({
        success: true,
        message: `User is already ${status.toLowerCase()}`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });
    }

    user.status = status;

    await user.save();

    res.status(200).json({
      success: true,
      message: `User status changed to ${status}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE USER
// Permanently delete Student/Alumni account
// ==========================================

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Find only Student/Alumni
    const user = await User.findOne({
      _id: id,
      role: { $in: ["STUDENT", "ALUMNI"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student or alumni user not found",
      });
    }

    // -----------------------------------
    // If Alumni, keep Alumni profile
    // -----------------------------------
    //
    // We deliberately do NOT delete the
    // Alumni profile here.
    //
    // User account and Alumni profile are
    // separate records.
    //
    // This prevents accidental loss of
    // college alumni data.
    // -----------------------------------

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};
