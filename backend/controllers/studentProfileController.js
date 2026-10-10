import StudentProfile from "../models/StudentProfile.js";

export const getMyStudentProfile = async () => {
  try {
    const response = await api.get("/student-profile/me");
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        success: false,
        notFound: true,
        message: "Student profile not found",
      };
    }

    throw error;
  }
};
export const updateStudentProfile = async (req, res) => {
  try {
    const {
      mobileNo,
      dob,
      nativePlace,
      currentLocation,
      college,
      department,
      enrollmentYear,
      expectedGraduationYear,
      currentYear,
      cgpa,
      skills,
      areaOfExpertise,
      careerInterests,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      photo,
      resumeUrl,
      profileVisibility,
    } = req.body;

    const profile = await StudentProfile.findOneAndUpdate(
      {
        user: req.user.userId,
      },
      {
        mobileNo,
        dob,
        nativePlace,
        currentLocation,
        college,
        department,
        enrollmentYear,
        expectedGraduationYear,
        currentYear,
        cgpa,
        skills,
        areaOfExpertise,
        careerInterests,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        photo,
        resumeUrl,
        profileVisibility,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    ).populate("user", "name email role");

    res.status(200).json({
      success: true,
      message: "Student profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update student profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update student profile",
      error: error.message,
    });
  }
};
export const getStudentProfileById = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      user: req.params.id,
    }).populate("user", "name email role");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const isOwner = profile.user._id.toString() === req.user.userId.toString();

    if (!isOwner) {
      if (req.user.role === "ALUMNI" && !profile.profileVisibility.alumni) {
        return res.status(403).json({
          success: false,
          message: "Student profile is not visible to alumni",
        });
      }

      if (req.user.role === "STUDENT" && !profile.profileVisibility.mentors) {
        return res.status(403).json({
          success: false,
          message: "Student profile is not visible",
        });
      }
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get student profile by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch student profile",
      error: error.message,
    });
  }
};
