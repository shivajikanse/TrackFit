const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["trainer", "member"],
      required: [true, "Role is required"],
    },
    trainerId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      // Generated only for trainers
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // set for members
    },
    profile: {
      age: Number,
      gender: { type: String, enum: ["male", "female", "other"] },
      height: Number, // in cm
      weight: Number, // in kg
      fitnessGoal: {
        type: String,
        enum: [
          "weight_loss",
          "muscle_gain",
          "endurance",
          "flexibility",
          "general_fitness",
        ],
      },
      activityLevel: {
        type: String,
        enum: ["sedentary", "light", "moderate", "very_active", "extra_active"],
      },
      medicalConditions: [String],
      allergies: [String],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual: BMI
userSchema.virtual("bmi").get(function () {
  if (this.profile?.height && this.profile?.weight) {
    const heightM = this.profile.height / 100;
    return (this.profile.weight / (heightM * heightM)).toFixed(1);
  }
  return null;
});

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ trainer: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);
