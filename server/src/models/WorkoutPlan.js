const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: Number,
  reps: String, // e.g., "10-12" or "15"
  duration: String, // e.g., "30 seconds"
  rest: String, // e.g., "60 seconds"
  notes: String,
  videoUrl: String,
  targetMuscles: [String],
  equipment: String,
});

const workoutDaySchema = new mongoose.Schema({
  day: { type: String, required: true }, // e.g., "Monday" or "Day 1"
  focus: String, // e.g., "Chest & Triceps"
  exercises: [exerciseSchema],
  estimatedDuration: Number, // in minutes
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
});

const workoutPlanSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    description: String,
    goal: String,
    durationWeeks: { type: Number, default: 4 },
    schedule: [workoutDaySchema],
    isAIGenerated: { type: Boolean, default: false },
    aiPromptUsed: { type: String, select: false },
    isActive: { type: Boolean, default: true },
    startDate: Date,
    endDate: Date,
    tags: [String],
  },
  { timestamps: true }
);

workoutPlanSchema.index({ member: 1, isActive: 1 });
workoutPlanSchema.index({ assignedBy: 1 });

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
