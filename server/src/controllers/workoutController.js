const WorkoutPlan = require('../models/WorkoutPlan');
const User = require('../models/User');
const { generateWorkoutPlan } = require('../services/aiService');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * @desc    Assign a manually-created workout plan to a member
 * @route   POST /api/workout/assign/:memberId
 * @access  Trainer
 */
exports.assignWorkout = async (req, res) => {
  try {
    const { memberId } = req.params;

    // Deactivate old plans
    await WorkoutPlan.updateMany({ member: memberId, isActive: true }, { isActive: false });

    const plan = await WorkoutPlan.create({
      ...req.body,
      member: memberId,
      assignedBy: req.user._id,
      isAIGenerated: false,
    });

    logger.info(`Trainer ${req.user.email} assigned workout to member ${memberId}`);
    successResponse(res, plan, 'Workout plan assigned successfully.', 201);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    AI-generate and assign a workout plan to a member
 * @route   POST /api/workout/ai-generate/:memberId
 * @access  Trainer
 */
exports.aiGenerateWorkout = async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await User.findOne({
      _id: memberId,
      trainer: req.user._id,
      role: 'member',
    });

    if (!member) {
      return errorResponse(res, 'Member not found or does not belong to you.', 404);
    }

    logger.info(`Generating AI workout for member ${memberId}`);
    const aiPlanData = await generateWorkoutPlan(member);

    // Deactivate old plans
    await WorkoutPlan.updateMany({ member: memberId, isActive: true }, { isActive: false });

    const plan = await WorkoutPlan.create({
      ...aiPlanData,
      member: memberId,
      assignedBy: req.user._id,
      isAIGenerated: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 4 * 7 * 24 * 60 * 60 * 1000), // 4 weeks
    });

    successResponse(res, plan, 'AI workout plan generated and assigned successfully.', 201);
  } catch (error) {
    logger.error(`AI workout generation failed: ${error.message}`);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get workout plan(s) for a member
 * @route   GET /api/workout/member/:memberId
 * @access  Trainer | Member (own)
 */
exports.getMemberWorkouts = async (req, res) => {
  try {
    const { memberId } = req.params;
    const targetMemberId = memberId || req.user._id;

    const plans = await WorkoutPlan.find({ member: targetMemberId })
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    successResponse(res, plans, 'Workout plans fetched.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get member's active workout plan (for member themselves)
 * @route   GET /api/workout/my-plan
 * @access  Member
 */
exports.getMyWorkout = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOne({
      member: req.user._id,
      isActive: true,
    }).populate('assignedBy', 'name email');

    if (!plan) {
      return errorResponse(res, 'No active workout plan found.', 404);
    }
    successResponse(res, plan, 'Active workout plan fetched.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get a specific workout plan by ID
 * @route   GET /api/workout/:planId
 * @access  Trainer | Member (own)
 */
exports.getWorkoutById = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.planId)
      .populate('assignedBy', 'name email')
      .populate('member', 'name email');

    if (!plan) return errorResponse(res, 'Workout plan not found.', 404);
    successResponse(res, plan, 'Workout plan fetched.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Update a workout plan
 * @route   PUT /api/workout/:planId
 * @access  Trainer
 */
exports.updateWorkout = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOneAndUpdate(
      { _id: req.params.planId, assignedBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!plan) return errorResponse(res, 'Plan not found or unauthorized.', 404);
    successResponse(res, plan, 'Workout plan updated.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Delete a workout plan
 * @route   DELETE /api/workout/:planId
 * @access  Trainer
 */
exports.deleteWorkout = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOneAndDelete({
      _id: req.params.planId,
      assignedBy: req.user._id,
    });
    if (!plan) return errorResponse(res, 'Plan not found or unauthorized.', 404);
    successResponse(res, null, 'Workout plan deleted.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};
