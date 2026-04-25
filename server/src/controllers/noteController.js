const Note = require('../models/Note');
const User = require('../models/User');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

/**
 * @desc    Create a note
 * @route   POST /api/member/notes
 * @access  Member | Trainer
 */
exports.createNote = async (req, res) => {
  try {
    const { content, title, category, isPrivate, tags, memberId } = req.body;

    // Trainer can create notes for a member; member creates for themselves
    const targetMemberId = req.user.role === 'trainer' ? memberId : req.user._id;

    if (req.user.role === 'trainer' && memberId) {
      const member = await User.findOne({ _id: memberId, trainer: req.user._id });
      if (!member) return errorResponse(res, 'Member not found or unauthorized.', 403);
    }

    const note = await Note.create({
      member: targetMemberId,
      author: req.user._id,
      authorRole: req.user.role,
      content,
      title,
      category,
      isPrivate: isPrivate || false,
      tags,
    });

    successResponse(res, note, 'Note created.', 201);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get notes
 * @route   GET /api/member/notes
 * @access  Member | Trainer
 */
exports.getNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { memberId, category } = req.query;

    let query;

    if (req.user.role === 'trainer') {
      // Trainers see all non-private notes for their members, and their own private notes
      query = {
        member: memberId || { $in: await User.find({ trainer: req.user._id }).distinct('_id') },
        $or: [{ isPrivate: false }, { author: req.user._id }],
      };
    } else {
      // Members see their own notes (private = only theirs, public = all by trainer too)
      query = {
        member: req.user._id,
        $or: [{ isPrivate: false }, { author: req.user._id }],
      };
    }

    if (category) query.category = category;

    const [notes, total] = await Promise.all([
      Note.find(query)
        .populate('author', 'name role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Note.countDocuments(query),
    ]);

    paginatedResponse(res, notes, { page, limit, total, totalPages: Math.ceil(total / limit) }, 'Notes fetched.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Update a note
 * @route   PUT /api/member/notes/:noteId
 * @access  Author only
 */
exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.noteId, author: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!note) return errorResponse(res, 'Note not found or unauthorized.', 404);
    successResponse(res, note, 'Note updated.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Delete a note
 * @route   DELETE /api/member/notes/:noteId
 * @access  Author only
 */
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.noteId,
      author: req.user._id,
    });
    if (!note) return errorResponse(res, 'Note not found or unauthorized.', 404);
    successResponse(res, null, 'Note deleted.');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};
