const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorRole: {
      type: String,
      enum: ['member', 'trainer'],
      required: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      maxlength: 5000,
    },
    category: {
      type: String,
      enum: ['general', 'workout', 'diet', 'medical', 'motivation', 'goal'],
      default: 'general',
    },
    isPrivate: {
      type: Boolean,
      default: false, // private = only visible to author
    },
    tags: [String],
    relatedProgress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Progress',
    },
  },
  { timestamps: true }
);

noteSchema.index({ member: 1, createdAt: -1 });
noteSchema.index({ author: 1 });
noteSchema.index({ isPrivate: 1, author: 1 });

module.exports = mongoose.model('Note', noteSchema);
