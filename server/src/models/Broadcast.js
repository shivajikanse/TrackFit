const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema(
  {
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 2000 },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    sentToAll: { type: Boolean, default: true },
    category: {
      type: String,
      enum: ['announcement', 'motivation', 'schedule_change', 'tip', 'reminder'],
      default: 'announcement',
    },
    readBy: [
      {
        member: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

broadcastSchema.index({ trainer: 1, createdAt: -1 });
broadcastSchema.index({ recipients: 1 });

module.exports = mongoose.model('Broadcast', broadcastSchema);
