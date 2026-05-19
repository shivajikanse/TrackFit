const Progress = require("../models/Progress");
const User = require("../models/User");
const { generateProgressFeedback } = require("../services/aiService");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/apiResponse");
const logger = require("../utils/logger");

/**
 * @desc    Log daily progress
 * @route   POST /api/progress/log
 * @access  Member
 */
exports.logProgress = async (req, res) => {
  try {
    const progressData = {
      ...req.body,
      member: req.user._id,
    };

    // Check if log exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await Progress.findOne({
      member: req.user._id,
      date: { $gte: today, $lt: tomorrow },
    });

    let progress;
    if (existing) {
      progress = await Progress.findByIdAndUpdate(existing._id, progressData, {
        new: true,
      });
    } else {
      progress = await Progress.create(progressData);
    }

    successResponse(
      res,
      progress,
      existing ? "Progress updated." : "Progress logged.",
      201,
    );
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get member's progress history
 * @route   GET /api/progress/history
 * @access  Member | Trainer
 */
exports.getProgressHistory = async (req, res) => {
  try {
    const memberId = req.params.memberId || req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    // Date filter
    const query = { member: memberId };
    if (req.query.from) query.date = { $gte: new Date(req.query.from) };
    if (req.query.to)
      query.date = { ...query.date, $lte: new Date(req.query.to) };

    const [logs, total] = await Promise.all([
      Progress.find(query).sort({ date: -1 }).skip(skip).limit(limit),
      Progress.countDocuments(query),
    ]);

    paginatedResponse(
      res,
      logs,
      { page, limit, total, totalPages: Math.ceil(total / limit) },
      "Progress history fetched.",
    );
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// /**
//  * @desc    Get AI feedback on member's progress
//  * @route   GET /api/member/ai-feedback
//  * @access  Member
//  */
// exports.getAIFeedback = async (req, res) => {
//   try {
//     const member = await User.findById(req.user._id);
//     const progressHistory = await Progress.find({ member: req.user._id })
//       .sort({ date: -1 })
//       .limit(30);

//     if (progressHistory.length < 3) {
//       return errorResponse(res, 'Please log at least 3 days of progress before requesting AI feedback.', 400);
//     }

//     // Use cached feedback if < 24 hours old
//     const latestLog = progressHistory[0];
//     if (
//       latestLog.aiFeedback?.content &&
//       latestLog.aiFeedback.generatedAt &&
//       Date.now() - new Date(latestLog.aiFeedback.generatedAt).getTime() < 24 * 60 * 60 * 1000
//     ) {
//       return successResponse(res, {
//         feedback: latestLog.aiFeedback.content,
//         generatedAt: latestLog.aiFeedback.generatedAt,
//         cached: true,
//       }, 'AI feedback fetched (cached).');
//     }

//     logger.info(`Generating AI feedback for member ${req.user._id}`);
//     const feedback = await generateProgressFeedback(member, progressHistory);

//     // Cache it
//     await Progress.findByIdAndUpdate(latestLog._id, {
//       'aiFeedback.content': feedback,
//       'aiFeedback.generatedAt': new Date(),
//     });

//     successResponse(res, {
//       feedback,
//       generatedAt: new Date(),
//       cached: false,
//     }, 'AI feedback generated successfully.');
//   } catch (error) {
//     logger.error(`AI feedback error: ${error.message}`);
//     errorResponse(res, error.message, 500);
//   }
// };

/**
 * @desc    Trainer adds notes to a member's progress
 * @route   PUT /api/progress/:progressId/trainer-notes
 * @access  Trainer
 */
exports.addTrainerNotes = async (req, res) => {
  try {
    const { trainerNotes } = req.body;
    const progress = await Progress.findById(req.params.progressId).populate(
      "member",
    );

    if (!progress) return errorResponse(res, "Progress log not found.", 404);

    // Verify this member belongs to trainer
    const member = await User.findOne({
      _id: progress.member,
      trainer: req.user._id,
    });
    if (!member) return errorResponse(res, "Unauthorized.", 403);

    progress.trainerNotes = trainerNotes;
    await progress.save();

    successResponse(res, progress, "Trainer notes added.");
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get progress analytics / summary for a member
 * @route   GET /api/progress/analytics/:memberId?
 * @access  Member | Trainer
 */
exports.getProgressAnalytics = async (req, res) => {
  try {
    const memberId = req.params.memberId || req.user._id;
    const logs = await Progress.find({ member: memberId })
      .sort({ date: 1 })
      .limit(90);

    if (!logs.length)
      return successResponse(res, {}, "No progress data found.");

    const withWeight = logs.filter((l) => l.weight);
    const withCalories = logs.filter((l) => l.caloriesConsumed);
    const workoutsDone = logs.filter((l) => l.workoutCompleted);

    const analytics = {
      totalLogs: logs.length,
      workoutCompletionRate: logs.length
        ? ((workoutsDone.length / logs.length) * 100).toFixed(1)
        : 0,
      weightHistory: withWeight.map((l) => ({
        date: l.date,
        weight: l.weight,
      })),
      avgCaloriesConsumed: withCalories.length
        ? (
            withCalories.reduce((s, l) => s + l.caloriesConsumed, 0) /
            withCalories.length
          ).toFixed(0)
        : null,
      avgEnergyLevel: logs.filter((l) => l.energyLevel).length
        ? (
            logs
              .filter((l) => l.energyLevel)
              .reduce((s, l) => s + l.energyLevel, 0) /
            logs.filter((l) => l.energyLevel).length
          ).toFixed(1)
        : null,
      avgSleepHours: logs.filter((l) => l.sleepHours).length
        ? (
            logs
              .filter((l) => l.sleepHours)
              .reduce((s, l) => s + l.sleepHours, 0) /
            logs.filter((l) => l.sleepHours).length
          ).toFixed(1)
        : null,
      weightChange:
        withWeight.length >= 2
          ? (
              withWeight[withWeight.length - 1].weight - withWeight[0].weight
            ).toFixed(1)
          : null,
    };

    successResponse(res, analytics, "Analytics fetched.");
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};
