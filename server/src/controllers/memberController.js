const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ── GET Member Profile ──────────────────────────────────────────
exports.getMemberProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -refreshToken",
    );

    if (!user) {
      return errorResponse(res, "Member not found", 404);
    }

    // Return user with full profile data
    successResponse(res, user, "Profile fetched successfully");
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// ── UPDATE Member Profile ──────────────────────────────────────────
exports.updateMemberProfile = async (req, res) => {
  try {
    const {
      age,
      gender,
      height,
      weight,
      fitnessGoal,
      activityLevel,
      medicalConditions,
      allergies,
    } = req.body;

    // Validation
    if (age && (age < 13 || age > 120)) {
      return errorResponse(res, "Age must be between 13 and 120", 400);
    }

    if (gender && !["male", "female", "other"].includes(gender)) {
      return errorResponse(res, "Invalid gender value", 400);
    }

    if (height && (height < 50 || height > 300)) {
      return errorResponse(res, "Height must be between 50cm and 300cm", 400);
    }

    if (weight && (weight < 20 || weight > 500)) {
      return errorResponse(res, "Weight must be between 20kg and 500kg", 400);
    }

    if (
      fitnessGoal &&
      ![
        "weight_loss",
        "muscle_gain",
        "endurance",
        "flexibility",
        "general_fitness",
      ].includes(fitnessGoal)
    ) {
      return errorResponse(res, "Invalid fitness goal", 400);
    }

    if (
      activityLevel &&
      ![
        "sedentary",
        "light",
        "moderate",
        "very_active",
        "extra_active",
      ].includes(activityLevel)
    ) {
      return errorResponse(res, "Invalid activity level", 400);
    }

    if (medicalConditions && !Array.isArray(medicalConditions)) {
      return errorResponse(res, "Medical conditions must be an array", 400);
    }

    if (allergies && !Array.isArray(allergies)) {
      return errorResponse(res, "Allergies must be an array", 400);
    }

    // Build update object with only provided fields
    const updateFields = {};
    if (age !== undefined) updateFields["profile.age"] = age;
    if (gender !== undefined) updateFields["profile.gender"] = gender;
    if (height !== undefined) updateFields["profile.height"] = height;
    if (weight !== undefined) updateFields["profile.weight"] = weight;
    if (fitnessGoal !== undefined)
      updateFields["profile.fitnessGoal"] = fitnessGoal;
    if (activityLevel !== undefined)
      updateFields["profile.activityLevel"] = activityLevel;
    if (medicalConditions !== undefined)
      updateFields["profile.medicalConditions"] = medicalConditions;
    if (allergies !== undefined) updateFields["profile.allergies"] = allergies;

    // Update only provided profile fields (preserves existing fields not in update)
    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    }).select("-password -refreshToken");

    successResponse(res, user, "Profile updated successfully");
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// ── GET Member Profile by ID (Trainer access) ──────────────────────────────────────────
exports.getMemberById = async (req, res) => {
  try {
    const { memberId } = req.params;

    // Verify trainer is accessing their own member
    const member = await User.findById(memberId);
    if (!member) {
      return errorResponse(res, "Member not found", 404);
    }

    if (member.trainer?.toString() !== req.user._id.toString()) {
      return errorResponse(res, "Unauthorized access to member profile", 403);
    }

    // Return member profile
    const memberData = await User.findById(memberId).select(
      "-password -refreshToken",
    );
    successResponse(res, memberData, "Member profile fetched successfully");
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// ── GET Member Profile for AI Analysis ──────────────────────────────────────────
exports.getMemberProfileForAI = async (req, res) => {
  try {
    const { memberId } = req.params;

    // Get member profile
    const member = await User.findById(memberId).select("profile name email");
    if (!member) {
      return errorResponse(res, "Member not found", 404);
    }

    // Return profile data formatted for AI
    const profileData = {
      name: member.name,
      email: member.email,
      ...member.profile,
    };

    successResponse(
      res,
      profileData,
      "Member profile for AI fetched successfully",
    );
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};
