import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Alumni from "../models/Alumni.js";

// ==========================================
// REGISTER USER
// ==========================================

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,

      // Alumni fields
      passoutYear,
      department,
      nativePlace,
      currentLocation,
      companyName,
      previousCompanies,
      areaOfExpertise,
      linkedinUrl,
      mobileNo,
      photo,
      dob,
    } = req.body;

    // -----------------------------------
    // 1. Required common fields
    // -----------------------------------

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // -----------------------------------
    // 2. Validate registration role
    // -----------------------------------

    if (role && !["STUDENT", "ALUMNI"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration role",
      });
    }

    const selectedRole = role || "STUDENT";

    // -----------------------------------
    // 3. Normalize email
    // -----------------------------------

    const normalizedEmail = email.toLowerCase().trim();

    // -----------------------------------
    // 4. Check existing User
    // -----------------------------------

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already registered with this email",
      });
    }

    // -----------------------------------
    // 5. If Alumni, validate required
    //    Alumni fields
    // -----------------------------------

    if (selectedRole === "ALUMNI") {
      if (
        !passoutYear ||
        !department ||
        !nativePlace ||
        !currentLocation ||
        !companyName ||
        !mobileNo ||
        !dob
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Passout year, department, native place, current location, company name, mobile number and date of birth are required for alumni registration",
        });
      }

      // Check if Alumni profile already exists
      const existingAlumni = await Alumni.findOne({
        email: normalizedEmail,
      });

      if (existingAlumni) {
        return res.status(409).json({
          success: false,
          message: "An alumni profile already exists with this email",
        });
      }

      // Check mobile number also
      const existingMobile = await Alumni.findOne({
        mobileNo: mobileNo.trim(),
      });

      if (existingMobile) {
        return res.status(409).json({
          success: false,
          message: "An alumni profile already exists with this mobile number",
        });
      }
    }

    // -----------------------------------
    // 6. Hash password
    // -----------------------------------

    const hashedPassword = await bcrypt.hash(password, 10);

    // -----------------------------------
    // 7. Create User
    // -----------------------------------

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: selectedRole,

      // New account is active by default
      status: "ACTIVE",
    });

    // -----------------------------------
    // 8. Create Alumni profile
    // -----------------------------------

    if (selectedRole === "ALUMNI") {
      const alumni = await Alumni.create({
        name: name.trim(),
        passoutYear: Number(passoutYear),
        department: department.trim(),
        nativePlace: nativePlace.trim(),
        currentLocation: currentLocation.trim(),
        companyName: companyName.trim(),

        previousCompanies: Array.isArray(previousCompanies)
          ? previousCompanies
          : [],

        areaOfExpertise: Array.isArray(areaOfExpertise) ? areaOfExpertise : [],

        linkedinUrl: linkedinUrl?.trim() || "",
        email: normalizedEmail,
        mobileNo: mobileNo.trim(),
        photo: photo?.trim() || "",
        dob: new Date(dob),
      });

      // Connect User → Alumni
      user.alumniId = alumni._id;

      await user.save();
    }

    // -----------------------------------
    // 9. Create JWT
    // -----------------------------------

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // -----------------------------------
    // 10. Response
    // -----------------------------------

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        alumniId: user.alumniId,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// ==========================================
// LOGIN USER
// ==========================================

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // -----------------------------------
    // 1. Validate input
    // -----------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // -----------------------------------
    // 2. Find user
    // -----------------------------------

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // -----------------------------------
    // 3. Check account status
    // -----------------------------------

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message:
          user.status === "SUSPENDED"
            ? "Your account has been suspended. Please contact the administrator."
            : "Your account is inactive. Please contact the administrator.",
      });
    }

    // -----------------------------------
    // 4. Compare password
    // -----------------------------------

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // -----------------------------------
    // 5. Generate JWT
    // -----------------------------------

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // -----------------------------------
    // 6. Return response
    // -----------------------------------

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        alumniId: user.alumniId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// ==========================================
// GET CURRENT USER
// ==========================================

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN TEST
// ==========================================

export const adminTest = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome Admin. You can access this route.",
  });
};

// ==========================================
// CHANGE PASSWORD
// ==========================================

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Find user
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check current password
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Prevent same password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};

// ==========================================
// GET NOTIFICATION PREFERENCES
// ==========================================

export const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "notificationPreferences",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const preferences = {
      jobs: user.notificationPreferences?.jobs ?? true,

      mentorship: user.notificationPreferences?.mentorship ?? true,

      events: user.notificationPreferences?.events ?? true,
    };

    res.status(200).json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error("Get notification preferences error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notification preferences",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE NOTIFICATION PREFERENCES
// ==========================================

export const updateNotificationPreferences = async (req, res) => {
  try {
    const { jobs, mentorship, events } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.notificationPreferences = {
      jobs:
        typeof jobs === "boolean"
          ? jobs
          : (user.notificationPreferences?.jobs ?? true),

      mentorship:
        typeof mentorship === "boolean"
          ? mentorship
          : (user.notificationPreferences?.mentorship ?? true),

      events:
        typeof events === "boolean"
          ? events
          : (user.notificationPreferences?.events ?? true),
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      preferences: user.notificationPreferences,
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update notification preferences",
      error: error.message,
    });
  }
};
