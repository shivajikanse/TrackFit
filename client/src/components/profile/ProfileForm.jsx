import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfileForm({
  initialData = {},
  onSubmit,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    age: initialData?.age || "",
    gender: initialData?.gender || "",
    height: initialData?.height || "",
    weight: initialData?.weight || "",
    fitnessGoal: initialData?.fitnessGoal || "",
    activityLevel: initialData?.activityLevel || "",
    medicalConditions: initialData?.medicalConditions || [],
    allergies: initialData?.allergies || [],
  });

  const [newCondition, setNewCondition] = useState("");
  const [newAllergy, setNewAllergy] = useState("");
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      setFormData({
        ...formData,
        medicalConditions: [...formData.medicalConditions, newCondition],
      });
      setNewCondition("");
    }
  };

  const handleRemoveCondition = (index) => {
    setFormData({
      ...formData,
      medicalConditions: formData.medicalConditions.filter(
        (_, i) => i !== index,
      ),
    });
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, newAllergy],
      });
      setNewAllergy("");
    }
  };

  const handleRemoveAllergy = (index) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter((_, i) => i !== index),
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.age && (formData.age < 13 || formData.age > 120)) {
      newErrors.age = "Age must be between 13 and 120";
    }

    if (formData.height && (formData.height < 50 || formData.height > 300)) {
      newErrors.height = "Height must be between 50cm and 300cm";
    }

    if (formData.weight && (formData.weight < 20 || formData.weight > 500)) {
      newErrors.weight = "Weight must be between 20kg and 500kg";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    // Remove empty strings and send only filled fields
    const dataToSend = {};
    Object.keys(formData).forEach((key) => {
      if (key === "medicalConditions" || key === "allergies") {
        dataToSend[key] = formData[key];
      } else if (formData[key] !== "") {
        dataToSend[key] = formData[key];
      }
    });

    try {
      await onSubmit(dataToSend);
    } catch (error) {
      // Error handled in parent component
    }
  };

  // Calculate BMI if height and weight are present
  const calculateBMI = () => {
    if (formData.height && formData.weight) {
      const heightM = formData.height / 100;
      return (formData.weight / (heightM * heightM)).toFixed(1);
    }
    return null;
  };

  const bmi = calculateBMI();
  const getBMICategory = (bmiValue) => {
    if (bmiValue < 18.5) return { text: "Underweight", color: "#4A9EFF" };
    if (bmiValue < 25) return { text: "Normal", color: "#39FF14" };
    if (bmiValue < 30) return { text: "Overweight", color: "#FFB800" };
    return { text: "Obese", color: "#FF3C2F" };
  };

  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Age */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <label
            className="block text-xs font-heading tracking-widest uppercase mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Age <span className="text-xs">(years)</span>
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="Enter your age"
            min="13"
            max="120"
            className="w-full px-4 py-3 rounded bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none transition-colors text-white placeholder:text-gray-600"
          />
          {errors.age && (
            <p
              className="text-xs mt-1 flex items-center gap-1"
              style={{ color: "var(--accent)" }}
            >
              <AlertCircle size={12} /> {errors.age}
            </p>
          )}
        </motion.div>

        {/* Gender */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label
            className="block text-xs font-heading tracking-widest uppercase mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none transition-colors text-white"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </motion.div>

        {/* Height */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <label
            className="block text-xs font-heading tracking-widest uppercase mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Height <span className="text-xs">(cm)</span>
          </label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleInputChange}
            placeholder="Enter your height in cm"
            min="50"
            max="300"
            className="w-full px-4 py-3 rounded bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none transition-colors text-white placeholder:text-gray-600"
          />
          {errors.height && (
            <p
              className="text-xs mt-1 flex items-center gap-1"
              style={{ color: "var(--accent)" }}
            >
              <AlertCircle size={12} /> {errors.height}
            </p>
          )}
        </motion.div>

        {/* Weight */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label
            className="block text-xs font-heading tracking-widest uppercase mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Weight <span className="text-xs">(kg)</span>
          </label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            placeholder="Enter your weight in kg"
            min="20"
            max="500"
            step="0.1"
            className="w-full px-4 py-3 rounded bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none transition-colors text-white placeholder:text-gray-600"
          />
          {errors.weight && (
            <p
              className="text-xs mt-1 flex items-center gap-1"
              style={{ color: "var(--accent)" }}
            >
              <AlertCircle size={12} /> {errors.weight}
            </p>
          )}
        </motion.div>
      </div>

      {/* BMI Display */}
      {bmi && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-4 rounded"
          style={{
            background: "rgba(255,60,47,0.08)",
            border: "1px solid rgba(255,60,47,0.15)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-xs font-heading tracking-widest uppercase mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                BMI Index
              </p>
              <p className="font-display text-2xl text-white">{bmi}</p>
            </div>
            <div className="text-right">
              <p
                className="text-xs mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Status
              </p>
              <p
                className="font-heading text-lg tracking-wider"
                style={{ color: bmiCategory.color }}
              >
                {bmiCategory.text}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Fitness Goal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label
          className="block text-xs font-heading tracking-widest uppercase mb-2"
          style={{ color: "var(--text-secondary)" }}
        >
          Fitness Goal
        </label>
        <select
          name="fitnessGoal"
          value={formData.fitnessGoal}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none transition-colors text-white"
        >
          <option value="">Select your fitness goal</option>
          <option value="weight_loss">Weight Loss</option>
          <option value="muscle_gain">Muscle Gain</option>
          <option value="endurance">Endurance</option>
          <option value="flexibility">Flexibility</option>
          <option value="general_fitness">General Fitness</option>
        </select>
      </motion.div>

      {/* Activity Level */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <label
          className="block text-xs font-heading tracking-widest uppercase mb-2"
          style={{ color: "var(--text-secondary)" }}
        >
          Activity Level
        </label>
        <select
          name="activityLevel"
          value={formData.activityLevel}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none transition-colors text-white"
        >
          <option value="">Select your activity level</option>
          <option value="sedentary">Sedentary (little or no exercise)</option>
          <option value="light">Light (exercise 1-3 days/week)</option>
          <option value="moderate">Moderate (exercise 3-5 days/week)</option>
          <option value="very_active">
            Very Active (exercise 6-7 days/week)
          </option>
          <option value="extra_active">
            Extra Active (physical job or training)
          </option>
        </select>
      </motion.div>

      {/* Medical Conditions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded"
        style={{
          background: "var(--bg-muted)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <label
          className="block text-xs font-heading tracking-widest uppercase mb-3"
          style={{ color: "var(--text-secondary)" }}
        >
          Medical Conditions
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newCondition}
            onChange={(e) => setNewCondition(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAddCondition())
            }
            placeholder="Add condition (e.g., Asthma)"
            className="flex-1 px-3 py-2 rounded text-sm bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none transition-colors text-white placeholder:text-gray-600"
          />
          <button
            type="button"
            onClick={handleAddCondition}
            className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1"
            style={{ color: "var(--accent)" }}
          >
            <Plus size={16} />
          </button>
        </div>
        {formData.medicalConditions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.medicalConditions.map((condition, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-3 py-1 rounded text-sm"
                style={{
                  background: "rgba(255,60,47,0.12)",
                  border: "1px solid rgba(255,60,47,0.25)",
                  color: "var(--accent)",
                }}
              >
                {condition}
                <button
                  type="button"
                  onClick={() => handleRemoveCondition(idx)}
                  className="hover:opacity-70 transition-opacity"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Allergies */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="p-4 rounded"
        style={{
          background: "var(--bg-muted)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <label
          className="block text-xs font-heading tracking-widest uppercase mb-3"
          style={{ color: "var(--text-secondary)" }}
        >
          Allergies
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAddAllergy())
            }
            placeholder="Add allergy (e.g., Peanuts)"
            className="flex-1 px-3 py-2 rounded text-sm bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none transition-colors text-white placeholder:text-gray-600"
          />
          <button
            type="button"
            onClick={handleAddAllergy}
            className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1"
            style={{ color: "var(--accent)" }}
          >
            <Plus size={16} />
          </button>
        </div>
        {formData.allergies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.allergies.map((allergy, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-3 py-1 rounded text-sm"
                style={{
                  background: "rgba(255,60,47,0.12)",
                  border: "1px solid rgba(255,60,47,0.25)",
                  color: "var(--accent)",
                }}
              >
                {allergy}
                <button
                  type="button"
                  onClick={() => handleRemoveAllergy(idx)}
                  className="hover:opacity-70 transition-opacity"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Submit Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        type="submit"
        disabled={loading}
        className="w-full btn-primary rounded uppercase font-heading tracking-wider py-3 transition-all"
        style={{
          background: loading ? "var(--text-secondary)" : "var(--accent)",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Updating Profile..." : "Save Profile"}
      </motion.button>
    </form>
  );
}
