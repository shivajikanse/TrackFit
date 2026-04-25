const User = require('../models/User');
const Broadcast = require('../models/Broadcast');
const WorkoutPlan = require('../models/WorkoutPlan');
const DietPlan = require('../models/DietPlan');
const Progress = require('../models/Progress');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * @desc    Add a member to trainer
 * @route   POST /api/trainer/member
 * @access  Trainer
 */
exports.addMember = async (req, res) => {
  try {
    const { email } = req.body;

    const member = await User.findOne({ email, role: 'member' });
    if (!member) {
      return errorResponse(res, 'No member found with this email.', 404);
    }

    if (member.trainer) {
      return errorResponse(res, 'This member is already assigned to a trainer.', 400);
    }

    member.trainer = req.user._id;
    await member.save({ validateBeforeSave: false });

    logger.info(`Trainer ${req.user.email} added member ${email}`);
    successResponse(res, member, 'Member added successfully.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get all members of a trainer
 * @route   GET /api/trainer/members
 * @access  Trainer
 */
exports.getMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = {
      trainer: req.user._id,
      role: 'member',
      isActive: true,
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [members, total] = await Promise.all([
      User.find(query).select('-password -refreshToken').skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    paginatedResponse(res, members, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }, 'Members fetched.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get a single member's full profile with stats
 * @route   GET /api/trainer/members/:memberId
 * @access  Trainer
 */
exports.getMemberDetails = async (req, res) => {
  try {
    const { memberId } = req.params;
    const member = await User.findOne({
      _id: memberId,
      trainer: req.user._id,
      role: 'member',
    }).select('-password -refreshToken');

    if (!member) {
      return errorResponse(res, 'Member not found.', 404);
    }

    const [activeWorkout, activeDiet, recentProgress] = await Promise.all([
      WorkoutPlan.findOne({ member: memberId, isActive: true }),
      DietPlan.findOne({ member: memberId, isActive: true }),
      Progress.find({ member: memberId }).sort({ date: -1 }).limit(7),
    ]);

    successResponse(res, {
      member,
      activeWorkout,
      activeDiet,
      recentProgress,
    }, 'Member details fetched.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Remove a member from trainer
 * @route   DELETE /api/trainer/members/:memberId
 * @access  Trainer
 */
exports.removeMember = async (req, res) => {
  try {
    const member = await User.findOneAndUpdate(
      { _id: req.params.memberId, trainer: req.user._id },
      { trainer: null },
      { new: true }
    );
    if (!member) {
      return errorResponse(res, 'Member not found.', 404);
    }
    successResponse(res, null, 'Member removed from your list.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Send broadcast message to all members
 * @route   POST /api/trainer/broadcast
 * @access  Trainer
 */
exports.broadcast = async (req, res) => {
  try {
    const { title, message, category, recipientIds } = req.body;

    let recipients = [];
    let sentToAll = true;

    if (recipientIds && recipientIds.length > 0) {
      recipients = recipientIds;
      sentToAll = false;
    } else {
      const members = await User.find({
        trainer: req.user._id,
        role: 'member',
        isActive: true,
      }).select('_id');
      recipients = members.map((m) => m._id);
    }

    const broadcastDoc = await Broadcast.create({
      trainer: req.user._id,
      title,
      message,
      category: category || 'announcement',
      recipients,
      sentToAll,
    });

    logger.info(`Trainer ${req.user.email} broadcast to ${recipients.length} members`);
    successResponse(res, broadcastDoc, `Broadcast sent to ${recipients.length} members.`, 201);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get all broadcasts by trainer
 * @route   GET /api/trainer/broadcasts
 * @access  Trainer
 */
exports.getBroadcasts = async (req, res) => {
  try {
    const broadcasts = await Broadcast.find({ trainer: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('recipients', 'name email');
    successResponse(res, broadcasts, 'Broadcasts fetched.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get trainer dashboard stats
 * @route   GET /api/trainer/dashboard
 * @access  Trainer
 */
exports.getDashboard = async (req, res) => {
  try {
    const [totalMembers, activeWorkouts, activeDiets] = await Promise.all([
      User.countDocuments({ trainer: req.user._id, role: 'member', isActive: true }),
      WorkoutPlan.countDocuments({ assignedBy: req.user._id, isActive: true }),
      DietPlan.countDocuments({ assignedBy: req.user._id, isActive: true }),
    ]);

    const recentMembers = await User.find({
      trainer: req.user._id,
      role: 'member',
    })
      .select('name email profile.fitnessGoal createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    successResponse(res, {
      stats: { totalMembers, activeWorkouts, activeDiets },
      recentMembers,
    }, 'Dashboard data fetched.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};
