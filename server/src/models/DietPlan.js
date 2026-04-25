const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: String,
  calories: Number,
  protein: Number, // grams
  carbs: Number,   // grams
  fats: Number,    // grams
  notes: String,
});

const mealSchema = new mongoose.Schema({
  mealType: {
    type: String,
    enum: ['breakfast', 'mid_morning_snack', 'lunch', 'evening_snack', 'dinner', 'post_workout'],
    required: true,
  },
  time: String, // e.g., "8:00 AM"
  items: [mealItemSchema],
  totalCalories: Number,
});

const dietDaySchema = new mongoose.Schema({
  day: { type: String, required: true },
  meals: [mealSchema],
  totalDailyCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFats: Number,
  waterIntakeLiters: { type: Number, default: 2.5 },
  notes: String,
});

const dietPlanSchema = new mongoose.Schema(
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
    targetCalories: Number,
    targetProtein: Number,
    targetCarbs: Number,
    targetFats: Number,
    restrictions: [String], // e.g., ["vegetarian", "gluten-free"]
    schedule: [dietDaySchema],
    isAIGenerated: { type: Boolean, default: false },
    aiPromptUsed: { type: String, select: false },
    isActive: { type: Boolean, default: true },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

dietPlanSchema.index({ member: 1, isActive: 1 });
dietPlanSchema.index({ assignedBy: 1 });

module.exports = mongoose.model('DietPlan', dietPlanSchema);
