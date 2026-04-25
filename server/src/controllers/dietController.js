const DietPlan = require('../models/DietPlan');
const User = require('../models/User');
const { generateDietPlan } = require('../services/aiService');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * @desc    Assign a manually-created diet plan
 * @route   POST /api/diet/assign/:memberId
 * @access  Trainer
 */
exports.assignDiet = async (req, res) => {
  try {
    const { memberId } = req.params;

    await DietPlan.updateMany({ member: memberId, isActive: true }, { isActive: false });

    const plan = await DietPlan.create({
      ...req.body,
      member: memberId,
      assignedBy: req.user._id,
      isAIGenerated: false,
    });

    logger.info(`Trainer ${req.user.email} assigned diet to member ${memberId}`);
    successResponse(res, plan, 'Diet plan assigned successfully.', 201);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    AI-generate and assign a diet plan
 * @route   POST /api/diet/ai-generate/:memberId
 * @access  Trainer
 */
exports.aiGenerateDiet = async (req, res) => {
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

    logger.info(`Generating AI diet for member ${memberId}`);
    const aiPlanData = await generateDietPlan(member);

    await DietPlan.updateMany({ member: memberId, isActive: true }, { isActive: false });

    const plan = await DietPlan.create({
      ...aiPlanData,
      member: memberId,
      assignedBy: req.user._id,
      isAIGenerated: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
    });

    successResponse(res, plan, 'AI diet plan generated and assigned successfully.', 201);
  } catch (error) {
    logger.error(`AI diet generation failed: ${error.message}`);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get member's active diet plan
 * @route   GET /api/diet/my-plan
 * @access  Member
 */
exports.getMyDiet = async (req, res) => {
  try {
    const plan = await DietPlan.findOne({
      member: req.user._id,
      isActive: true,
    }).populate('assignedBy', 'name email');

    if (!plan) return errorResponse(res, 'No active diet plan found.', 404);
    successResponse(res, plan, 'Active diet plan fetched.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get all diet plans for a member
 * @route   GET /api/diet/member/:memberId
 * @access  Trainer | Member (own)
 */
exports.getMemberDiets = async (req, res) => {
  try {
    const targetMemberId = req.params.memberId || req.user._id;
    const plans = await DietPlan.find({ member: targetMemberId })
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });
    successResponse(res, plans, 'Diet plans fetched.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Update a diet plan
 * @route   PUT /api/diet/:planId
 * @access  Trainer
 */
exports.updateDiet = async (req, res) => {
  try {
    const plan = await DietPlan.findOneAndUpdate(
      { _id: req.params.planId, assignedBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!plan) return errorResponse(res, 'Plan not found or unauthorized.', 404);
    successResponse(res, plan, 'Diet plan updated.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Delete a diet plan
 * @route   DELETE /api/diet/:planId
 * @access  Trainer
 */
exports.deleteDiet = async (req, res) => {
  try {
    const plan = await DietPlan.findOneAndDelete({
      _id: req.params.planId,
      assignedBy: req.user._id,
    });
    if (!plan) return errorResponse(res, 'Plan not found or unauthorized.', 404);
    successResponse(res, null, 'Diet plan deleted.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};
