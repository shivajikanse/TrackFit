import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Apple, Droplets, Flame, ChevronDown, ChevronUp } from "lucide-react";
import { dietService } from "../../services";
import {
  PageWrapper,
  SectionHeader,
  SkeletonList,
  EmptyState,
  Badge,
} from "../../components/ui";

const mockDiet = {
  title: "High-Protein Fat Loss Plan",
  assignedBy: "Coach Mike",
  calories: 2400,
  protein: 180,
  carbs: 220,
  fat: 70,
  water: 3.5,
  meals: [
    {
      name: "Breakfast",
      time: "7:00 AM",
      calories: 520,
      items: [
        { name: "Egg whites", qty: "6 whole", protein: 26, carbs: 2, fat: 1 },
        { name: "Oatmeal", qty: "100g", protein: 13, carbs: 67, fat: 7 },
        { name: "Banana", qty: "1 medium", protein: 1, carbs: 27, fat: 0 },
        {
          name: "Whey protein shake",
          qty: "1 scoop",
          protein: 25,
          carbs: 3,
          fat: 1,
        },
      ],
    },
    {
      name: "Lunch",
      time: "12:30 PM",
      calories: 680,
      items: [
        { name: "Chicken breast", qty: "220g", protein: 55, carbs: 0, fat: 5 },
        {
          name: "Brown rice",
          qty: "150g cooked",
          protein: 4,
          carbs: 44,
          fat: 1,
        },
        { name: "Broccoli", qty: "200g", protein: 5, carbs: 14, fat: 0 },
        { name: "Olive oil", qty: "1 tbsp", protein: 0, carbs: 0, fat: 14 },
      ],
    },
    {
      name: "Pre-Workout Snack",
      time: "4:00 PM",
      calories: 280,
      items: [
        { name: "Greek yoghurt", qty: "200g", protein: 20, carbs: 10, fat: 5 },
        { name: "Almonds", qty: "30g", protein: 6, carbs: 3, fat: 15 },
      ],
    },
    {
      name: "Dinner",
      time: "7:30 PM",
      calories: 620,
      items: [
        { name: "Salmon fillet", qty: "200g", protein: 42, carbs: 0, fat: 22 },
        { name: "Sweet potato", qty: "200g", protein: 4, carbs: 46, fat: 0 },
        {
          name: "Mixed greens salad",
          qty: "150g",
          protein: 3,
          carbs: 8,
          fat: 5,
        },
      ],
    },
    {
      name: "Post-Workout / Evening",
      time: "9:00 PM",
      calories: 300,
      items: [
        { name: "Cottage cheese", qty: "200g", protein: 24, carbs: 6, fat: 4 },
        {
          name: "Casein protein",
          qty: "1 scoop",
          protein: 25,
          carbs: 3,
          fat: 2,
        },
      ],
    },
  ],
};

function MacroBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span
          className="text-xs font-heading tracking-wider uppercase"
          style={{ color: "var(--text-secondary)" }}
        >
          {label}
        </span>
        <span className="text-xs font-medium text-white">{value}g</span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--bg-muted-light)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </div>
  );
}

function MealCard({ meal, index }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:bg-white/3"
        style={{
          background: open ? "rgba(255,60,47,0.06)" : "var(--bg-muted)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-9 h-9 rounded flex items-center justify-center font-display text-lg"
            style={{
              background: "rgba(255,60,47,0.12)",
              color: "var(--accent)",
            }}
          >
            {["🌅", "🥗", "🍎", "🍽️", "🌙"][index] || "🍴"}
          </div>
          <div className="text-left">
            <p className="font-heading font-semibold text-sm uppercase tracking-wide text-white">
              {meal.name}
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {meal.time}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p
              className="font-display text-xl"
              style={{ color: "var(--accent)" }}
            >
              {meal.calories}
            </p>
            <p
              className="text-xs font-heading tracking-wider uppercase"
              style={{ color: "var(--text-secondary)" }}
            >
              kcal
            </p>
          </div>
          <span style={{ color: "var(--text-secondary)" }}>
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </button>

      {/* Items */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden", background: "rgba(255,255,255,0.01)" }}
          >
            <div
              className="px-5 py-4 border-t"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}
            >
              {/* Macro summary row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  [
                    "Protein",
                    meal.items.reduce((s, i) => s + (i.protein || 0), 0),
                    "#FF3C2F",
                  ],
                  [
                    "Carbs",
                    meal.items.reduce((s, i) => s + (i.carbs || 0), 0),
                    "#FFB800",
                  ],
                  [
                    "Fat",
                    meal.items.reduce((s, i) => s + (i.fat || 0), 0),
                    "#39FF14",
                  ],
                ].map(([label, val, color]) => (
                  <div
                    key={label}
                    className="text-center py-2 rounded"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <p className="font-display text-xl" style={{ color }}>
                      {val}g
                    </p>
                    <p
                      className="text-xs font-heading tracking-wider uppercase"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Food items */}
              <div className="space-y-2.5">
                {meal.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                    style={{ borderColor: "rgba(255,255,255,0.04)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: "var(--accent)" }}
                      />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {item.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {item.qty}
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex gap-4 text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span>
                        <span className="text-white font-medium">
                          {item.protein}g
                        </span>{" "}
                        P
                      </span>
                      <span>
                        <span className="text-white font-medium">
                          {item.carbs}g
                        </span>{" "}
                        C
                      </span>
                      <span>
                        <span className="text-white font-medium">
                          {item.fat}g
                        </span>{" "}
                        F
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MyDiet() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dietService
      .getMyPlan()
      .then(({ data }) => {
        // Backend returns: { success, message, data: {...plan object...} }
        const plan = data?.data || data;
        setPlan(plan);
      })
      .catch(() => setPlan(mockDiet))
      .finally(() => setLoading(false));
  }, []);

  // Flatten meals from schedule structure or use flat meals array
  const getMeals = () => {
    if (plan?.meals) return plan.meals;
    if (plan?.schedule?.length > 0) {
      return plan.schedule.flatMap((day) => day.meals || []);
    }
    if (mockDiet?.meals) return mockDiet.meals;
    return [];
  };
  const meals = getMeals();

  const p = plan || mockDiet;

  return (
    <PageWrapper>
      <SectionHeader
        title="My Diet Plan"
        sub={
          plan
            ? `${plan.title} • Assigned by ${typeof plan.assignedBy === "object" ? plan.assignedBy.name : plan.assignedBy}`
            : ""
        }
      />

      {loading ? (
        <SkeletonList count={5} />
      ) : !plan ? (
        <EmptyState
          icon={Apple}
          title="No Diet Plan Yet"
          sub="Your trainer hasn't assigned a diet plan yet"
        />
      ) : (
        <>
          {/* Macro overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
            {/* Daily targets */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 p-6 rounded"
              style={{
                background: "var(--bg-muted)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p
                className="font-heading text-xs tracking-widest uppercase mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                Daily Macro Targets
              </p>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  {
                    label: "Calories",
                    value: p.calories,
                    unit: "kcal",
                    color: "var(--accent)",
                  },
                  {
                    label: "Protein",
                    value: `${p.protein}g`,
                    unit: "",
                    color: "#FF3C2F",
                  },
                  {
                    label: "Carbs",
                    value: `${p.carbs}g`,
                    unit: "",
                    color: "#FFB800",
                  },
                  {
                    label: "Fat",
                    value: `${p.fat}g`,
                    unit: "",
                    color: "#39FF14",
                  },
                ].map(({ label, value, unit, color }) => (
                  <div
                    key={label}
                    className="text-center py-3 rounded"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <p className="font-display text-2xl" style={{ color }}>
                      {value}
                    </p>
                    <p
                      className="text-xs font-heading tracking-wider uppercase mt-0.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <MacroBar
                  label="Protein"
                  value={p.protein}
                  max={250}
                  color="#FF3C2F"
                />
                <MacroBar
                  label="Carbohydrates"
                  value={p.carbs}
                  max={300}
                  color="#FFB800"
                />
                <MacroBar label="Fat" value={p.fat} max={100} color="#39FF14" />
              </div>
            </motion.div>

            {/* Water & plan info */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col gap-4"
            >
              <div
                className="p-5 rounded flex-1"
                style={{
                  background: "var(--bg-muted)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Droplets size={16} style={{ color: "#4FC3F7" }} />
                  <p
                    className="font-heading text-xs tracking-widest uppercase"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Daily Water Goal
                  </p>
                </div>
                <p className="font-display text-4xl text-white">
                  {p.water || 3.5}L
                </p>
                <div
                  className="mt-3 h-2 rounded-full overflow-hidden"
                  style={{ background: "var(--bg-muted-light)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "#4FC3F7", width: "65%" }}
                    initial={{ width: 0 }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                  />
                </div>
                <p
                  className="text-xs mt-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  2.3L consumed today
                </p>
              </div>

              <div
                className="p-5 rounded"
                style={{
                  background: "var(--bg-muted)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <p
                  className="font-heading text-xs tracking-widest uppercase mb-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Plan Info
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Plan
                    </span>
                    <span className="text-sm text-white">{p.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Meals/day
                    </span>
                    <span className="text-sm text-white">
                      {p.meals?.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Assigned by
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "var(--accent)" }}
                    >
                      {p.assignedBy}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Meals */}
          <div>
            <p
              className="font-heading text-xs tracking-widest uppercase mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              Meal Breakdown — {meals.length} meals today
            </p>
            <div className="space-y-3">
              {meals.map((meal, i) => (
                <MealCard key={i} meal={meal} index={i} />
              ))}
            </div>
          </div>
        </>
      )}
    </PageWrapper>
  );
}
