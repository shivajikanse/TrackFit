const Broadcast = require("../models/Broadcast");
const User = require("../models/User");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/apiResponse");
const logger = require("../utils/logger");

/**
 * @desc    Get received broadcasts for member
 * @route   GET /api/messages/inbox
 * @access  Member
 */
exports.getInbox = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get broadcasts sent to this member (or sent to all members)
    const broadcasts = await Broadcast.find({
      $or: [
        { recipients: req.user._id },
        { sentToAll: true, trainer: req.user.trainer },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("trainer", "name email trainerId")
      .lean();

    const total = await Broadcast.countDocuments({
      $or: [
        { recipients: req.user._id },
        { sentToAll: true, trainer: req.user.trainer },
      ],
    });

    const formatted = broadcasts.map((msg) => {
      const isRead = msg.readBy.some(
        (r) => r.member.toString() === req.user._id.toString(),
      );
      return {
        _id: msg._id,
        type: msg.sentToAll ? "broadcast" : "personal",
        from: msg.trainer.name,
        subject: msg.title,
        message: msg.message,
        sentAt: msg.createdAt,
        read: isRead,
        sender: msg.trainer,
      };
    });

    paginatedResponse(
      res,
      formatted,
      {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      "Messages fetched successfully.",
    );
  } catch (error) {
    logger.error(`Get inbox error: ${error.message}`);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Mark broadcast as read
 * @route   PUT /api/messages/:id/read
 * @access  Member
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const broadcast = await Broadcast.findById(id);
    if (!broadcast) {
      return errorResponse(res, "Message not found", 404);
    }

    const alreadyRead = broadcast.readBy.some(
      (r) => r.member.toString() === req.user._id.toString(),
    );

    if (!alreadyRead) {
      broadcast.readBy.push({
        member: req.user._id,
        readAt: new Date(),
      });
      await broadcast.save();
    }

    successResponse(res, broadcast, "Message marked as read");
  } catch (error) {
    logger.error(`Mark as read error: ${error.message}`);
    errorResponse(res, error.message, 500);
  }
};
