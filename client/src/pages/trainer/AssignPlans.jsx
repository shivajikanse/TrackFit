import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Dumbbell, Apple, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { trainerService, workoutService, dietService } from "../../services";
import {
  PageWrapper,
  SectionHeader,
  Select,
  Input,
  Textarea,
} from "../../components/ui";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AssignPlans() {
  const [tab, setTab] = useState("workout");
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [generating, setGenerating] = useState(false);

  // Workout state
  const [workoutPlan, setWorkoutPlan] = useState({
    title: "",
    day: "Monday",
    exercises: [{ name: "", sets: 3, reps: 10, rest: 60 }],
  });

  // Diet state
  const [dietPlan, setDietPlan] = useState({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 60,
    meals: [{ name: "Breakfast", items: ["Oats with milk", "Banana"] }],
  });

  // Fetch members on mount
  useEffect(() => {
    trainerService
      .getMembers()
      .then(({ data }) => {
        // Backend returns: { success, message, data: [...members...], pagination }
        const membersList = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
        setMembers(membersList);
      })
      .catch((err) => {
        console.error("Failed to fetch members:", err);
        toast.error("Failed to load members");
      });
  }, []);

  const addExercise = () =>
    setWorkoutPlan((p) => ({
      ...p,
      exercises: [...p.exercises, { name: "", sets: 3, reps: 10, rest: 60 }],
    }));
  const removeExercise = (i) =>
    setWorkoutPlan((p) => ({
      ...p,
      exercises: p.exercises.filter((_, idx) => idx !== i),
    }));
  const updateExercise = (i, k, v) =>
    setWorkoutPlan((p) => ({
      ...p,
      exercises: p.exercises.map((e, idx) =>
        idx === i ? { ...e, [k]: v } : e,
      ),
    }));

  const submitWorkout = async (e) => {
    e.preventDefault();
    if (!selectedMember) return toast.error("Select a member first");
    try {
      await workoutService.assignWorkout(selectedMember, workoutPlan);
      toast.success("Workout plan assigned!");
    } catch {
      toast.error("Failed to assign workout");
    }
  };

  const submitDiet = async (e) => {
    e.preventDefault();
    if (!selectedMember) return toast.error("Select a member first");
    try {
      await dietService.assignDiet(selectedMember, dietPlan);
      toast.success("Diet plan assigned!");
    } catch {
      toast.error("Failed to assign diet");
    }
  };

  const aiGenerateWorkout = async () => {
    if (!selectedMember) return toast.error("Select a member first");
    setGenerating(true);
    try {
      const { data } = await workoutService.aiGenerate(selectedMember, {
        goal: "muscle_gain",
        level: "intermediate",
      });
      if (data.plan) setWorkoutPlan(data.plan);
      toast.success("AI workout plan generated!");
    } catch {
      // Mock AI response
      setWorkoutPlan({
        title: "AI: Upper Body Power",
        day: "Monday",
        exercises: [
          { name: "Bench Press", sets: 4, reps: 8, rest: 90 },
          { name: "Pull-ups", sets: 3, reps: 10, rest: 60 },
          { name: "Shoulder Press", sets: 3, reps: 12, rest: 60 },
          { name: "Bicep Curls", sets: 3, reps: 15, rest: 45 },
        ],
      });
      toast.success("AI workout plan generated! (demo)");
    } finally {
      setGenerating(false);
    }
  };

  const aiGenerateDiet = async () => {
    if (!selectedMember) return toast.error("Select a member first");
    setGenerating(true);
    try {
      const { data } = await dietService.aiGenerate(selectedMember, {});
      if (data.plan) setDietPlan(data.plan);
      toast.success("AI diet plan generated!");
    } catch {
      setDietPlan({
        calories: 2400,
        protein: 180,
        carbs: 240,
        fat: 70,
        meals: [
          {
            name: "Breakfast",
            items: ["6 egg whites", "Oatmeal 100g", "Banana"],
          },
          {
            name: "Lunch",
            items: ["Chicken breast 200g", "Brown rice 150g", "Broccoli"],
          },
          {
            name: "Dinner",
            items: ["Salmon 180g", "Sweet potato", "Mixed greens"],
          },
        ],
      });
      toast.success("AI diet plan generated! (demo)");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <PageWrapper>
      <SectionHeader
        title="Assign Plans"
        sub="Create personalized workout and diet plans for your members"
      />

      {/* Member select */}
      <div className="mb-6">
        <Select
          label="Select Member"
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
        >
          <option value="">— Choose a member —</option>
          {Array.isArray(members) &&
            members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
        </Select>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-0 mb-8 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        {[
          { id: "workout", icon: Dumbbell, label: "Workout Plan" },
          { id: "diet", icon: Apple, label: "Diet Plan" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-2 px-6 py-3 font-heading text-sm tracking-wider uppercase transition-all relative"
            style={{
              color: tab === id ? "var(--accent)" : "var(--text-secondary)",
            }}
          >
            <Icon size={16} />
            {label}
            {tab === id && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: "var(--accent)" }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "workout" && (
          <motion.div
            key="workout"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading font-semibold text-lg uppercase tracking-wide text-white">
                Workout Builder
              </h3>
              <button
                onClick={aiGenerateWorkout}
                disabled={generating}
                className="btn-primary flex items-center gap-2 py-2 px-5 text-sm"
                style={{ borderRadius: 0, opacity: generating ? 0.7 : 1 }}
              >
                <Zap size={14} /> {generating ? "Generating..." : "AI Generate"}
              </button>
            </div>

            <form onSubmit={submitWorkout} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Plan Title"
                  value={workoutPlan.title}
                  onChange={(e) =>
                    setWorkoutPlan((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="Upper Body Power"
                  required
                />
                <Select
                  label="Day"
                  value={workoutPlan.day}
                  onChange={(e) =>
                    setWorkoutPlan((p) => ({ ...p, day: e.target.value }))
                  }
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label
                    className="text-xs font-heading tracking-widest uppercase"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Exercises
                  </label>
                  <button
                    type="button"
                    onClick={addExercise}
                    className="flex items-center gap-1 text-xs font-heading tracking-wider uppercase transition-colors hover:text-white"
                    style={{ color: "var(--accent)" }}
                  >
                    <Plus size={12} /> Add Exercise
                  </button>
                </div>
                {workoutPlan.exercises.map((ex, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-12 gap-3 items-center p-4 rounded"
                    style={{
                      background: "var(--bg-muted)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="col-span-4">
                      <input
                        className="input-dark rounded text-sm"
                        placeholder="Exercise name"
                        value={ex.name}
                        onChange={(e) =>
                          updateExercise(i, "name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        className="input-dark rounded text-sm"
                        type="number"
                        placeholder="Sets"
                        value={ex.sets}
                        onChange={(e) =>
                          updateExercise(i, "sets", +e.target.value)
                        }
                        min={1}
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        className="input-dark rounded text-sm"
                        type="number"
                        placeholder="Reps"
                        value={ex.reps}
                        onChange={(e) =>
                          updateExercise(i, "reps", +e.target.value)
                        }
                        min={1}
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        className="input-dark rounded text-sm"
                        type="number"
                        placeholder="Rest (s)"
                        value={ex.rest}
                        onChange={(e) =>
                          updateExercise(i, "rest", +e.target.value)
                        }
                        min={0}
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeExercise(i)}
                        className="p-1.5 rounded transition-colors hover:bg-red/10"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-3"
                style={{ borderRadius: 0 }}
              >
                Assign Workout Plan
              </button>
            </form>
          </motion.div>
        )}

        {tab === "diet" && (
          <motion.div
            key="diet"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading font-semibold text-lg uppercase tracking-wide text-white">
                Diet Builder
              </h3>
              <button
                onClick={aiGenerateDiet}
                disabled={generating}
                className="btn-primary flex items-center gap-2 py-2 px-5 text-sm"
                style={{ borderRadius: 0, opacity: generating ? 0.7 : 1 }}
              >
                <Zap size={14} /> {generating ? "Generating..." : "AI Generate"}
              </button>
            </div>

            <form onSubmit={submitDiet} className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  ["calories", "Daily Calories", "kcal"],
                  ["protein", "Protein", "g"],
                  ["carbs", "Carbs", "g"],
                  ["fat", "Fat", "g"],
                ].map(([k, l, u]) => (
                  <div
                    key={k}
                    className="p-4 rounded text-center"
                    style={{
                      background: "var(--bg-muted)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <p
                      className="text-xs font-heading tracking-wider uppercase mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {l}
                    </p>
                    <input
                      className="w-full text-center text-xl font-display bg-transparent border-none outline-none text-white"
                      type="number"
                      value={dietPlan[k]}
                      onChange={(e) =>
                        setDietPlan((p) => ({ ...p, [k]: +e.target.value }))
                      }
                    />
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--accent)" }}
                    >
                      {u}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <label
                  className="text-xs font-heading tracking-widest uppercase"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Meal Plan
                </label>
                {dietPlan.meals.map((meal, i) => (
                  <div
                    key={i}
                    className="p-4 rounded"
                    style={{
                      background: "var(--bg-muted)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <p className="font-heading text-sm font-semibold tracking-wider uppercase text-white mb-2">
                      {meal.name}
                    </p>
                    <div className="space-y-1">
                      {meal.items.map((item, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              background: "var(--accent)",
                              flexShrink: 0,
                            }}
                          />
                          <p
                            className="text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-3"
                style={{ borderRadius: 0 }}
              >
                Assign Diet Plan
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
