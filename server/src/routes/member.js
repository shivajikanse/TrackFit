const router = require("express").Router();
const { protect } = require("../middleware/auth");
const {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");
const {
  getMemberProfile,
  updateMemberProfile,
  getMemberById,
  getMemberProfileForAI,
} = require("../controllers/memberController");
const Broadcast = require("../models/Broadcast");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ── Profile Routes ─────────────────────────────────────────
router.get("/profile", protect, getMemberProfile);
router.put("/profile", protect, updateMemberProfile);
router.get("/profile/:memberId", protect, getMemberById);
router.get("/profile-ai/:memberId", protect, getMemberProfileForAI);

// Notes
router.post("/notes", protect, createNote);
router.get("/notes", protect, getNotes);
router.put("/notes/:noteId", protect, updateNote);
router.delete("/notes/:noteId", protect, deleteNote);

// Inbox - broadcasts for member
router.get("/inbox", protect, async (req, res) => {
  try {
    const broadcasts = await Broadcast.find({
      $or: [{ sentToAll: true }, { recipients: req.user._id }],
    })
      .populate("trainer", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    // Mark as read
    await Broadcast.updateMany(
      {
        _id: { $in: broadcasts.map((b) => b._id) },
        "readBy.member": { $ne: req.user._id },
      },
      { $push: { readBy: { member: req.user._id } } },
    );

    successResponse(res, broadcasts, "Inbox fetched.");
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
});

module.exports = router;
