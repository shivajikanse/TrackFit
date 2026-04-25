const mongoose = require('mongoose');

const exerciseLogSchema = new mongoose.Schema({
  exerciseName: { type: String, required: true },
  setsCompleted: Number,
  repsCompleted: String,
  weightUsed: Number, // in kg
  duration: Number, // in minutes
  notes: String,
  felt: { type: String, enum: ['easy', 'moderate', 'hard', 'exhausting'] },
});

const progressSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // Body metrics
    weight: Number,
    bodyFatPercentage: Number,
    muscleMass: Number,
    bmi: Number,
    measurements: {
      chest: Number,
      waist: Number,
      hips: Number,
      arms: Number,
      thighs: Number,
    },
    // Workout log
    workoutPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutPlan',
    },
    workoutCompleted: { type: Boolean, default: false },
    workoutDuration: Number, // in minutes
    exercisesLogged: [exerciseLogSchema],
    // Diet adherence
    dietPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DietPlan',
    },
    caloriesConsumed: Number,
    waterConsumed: Number, // in liters
    dietAdherence: {
      type: Number,
      min: 0,
      max: 100,
    }, // percentage
    // Wellness
    sleepHours: Number,
    energyLevel: { type: Number, min: 1, max: 10 },
    stressLevel: { type: Number, min: 1, max: 10 },
    mood: {
      type: String,
      enum: ['excellent', 'good', 'neutral', 'bad', 'terrible'],
    },
    // Notes
    memberNotes: String,
    trainerNotes: String,
    // AI feedback cache
    aiFeedback: {
      content: String,
      generatedAt: Date,
    },
  },
  { timestamps: true }
);

progressSchema.index({ member: 1, date: -1 });
progressSchema.index({ member: 1, createdAt: -1 });

module.exports = mongoose.model('Progress', progressSchema);
