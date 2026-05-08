import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Check, Clock } from "lucide-react";
import { workoutService } from "../../services";
import {
  PageWrapper,
  SectionHeader,
  Badge,
  SkeletonList,
  EmptyState,
} from "../../components/ui";

const mockPlan = {
  title: "Upper Body Power",
  assignedBy: "Coach Mike",
  week: "Week 3 of 8",
  exercises: [
    {
      name: "Bench Press",
      sets: 4,
      reps: 8,
      rest: 90,
      notes: "Focus on slow eccentric",
      done: false,
    },
    {
      name: "Pull-ups",
      sets: 3,
      reps: 10,
      rest: 60,
      notes: "Full range of motion",
      done: false,
    },
    {
      name: "Shoulder Press",
      sets: 3,
      reps: 12,
      rest: 60,
      notes: null,
      done: false,
    },
    {
      name: "Bicep Curls",
      sets: 3,
      reps: 15,
      rest: 45,
      notes: "Supinate at top",
      done: false,
    },
    {
      name: "Tricep Dips",
      sets: 3,
      reps: 12,
      rest: 45,
      notes: null,
      done: false,
    },
  ],
};

export default function MyWorkout() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState({});

  useEffect(() => {
    workoutService
      .getMyPlan()
      .then(({ data }) => {
        // Backend returns: { success, message, data: {...plan object...} }
        const plan = data?.data || data;
        setPlan(plan);
      })
      .catch(() => setPlan(mockPlan))
      .finally(() => setLoading(false));
  }, []);

  const toggleDone = (i) => setDone((d) => ({ ...d, [i]: !d[i] }));
  const doneCount = Object.values(done).filter(Boolean).length;
  const totalCount = plan?.exercises?.length || 0;

  return (
    <PageWrapper>
      <SectionHeader
        title="Today's Workout"
        sub={
          plan ? `${plan.title} • ${plan.week || ""}` : "Loading your plan..."
        }
      />

      {loading ? (
        <SkeletonList count={5} />
      ) : !plan ? (
        <EmptyState
          icon={Dumbbell}
          title="No Workout Assigned"
          sub="Your trainer hasn't assigned a workout plan yet"
        />
      ) : (
        <>
          {/* Progress bar */}
          <div
            className="mb-8 p-5 rounded"
            style={{
              background: "var(--bg-muted)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p
                  className="font-heading text-xs tracking-widest uppercase mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Session Progress
                </p>
                <p className="font-display text-3xl text-white">
                  {doneCount}/{totalCount}{" "}
                  <span
                    className="text-lg"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    exercises
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p
                  className="font-display text-3xl"
                  style={{
                    color:
                      doneCount === totalCount
                        ? "var(--success)"
                        : "var(--accent)",
                  }}
                >
                  {totalCount > 0
                    ? Math.round((doneCount / totalCount) * 100)
                    : 0}
                  %
                </p>
                {doneCount === totalCount && totalCount > 0 && (
                  <p
                    className="text-xs font-heading tracking-wider"
                    style={{ color: "var(--success)" }}
                  >
                    SESSION COMPLETE 🎉
                  </p>
                )}
              </div>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "var(--bg-muted-light)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    doneCount === totalCount
                      ? "var(--success)"
                      : "var(--accent)",
                }}
                initial={{ width: 0 }}
                animate={{
                  width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%`,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Plan info */}
          <div className="flex gap-4 mb-6">
            <div
              className="px-3 py-1.5 rounded text-xs font-heading tracking-wider uppercase"
              style={{
                background: "rgba(255,60,47,0.08)",
                color: "var(--accent)",
                border: "1px solid rgba(255,60,47,0.15)",
              }}
            >
              {plan.title}
            </div>
            {plan.assignedBy && (
              <div
                className="px-3 py-1.5 rounded text-xs font-heading tracking-wider uppercase"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--text-secondary)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                By {plan.assignedBy}
              </div>
            )}
          </div>

          {/* Exercises */}
          <div className="space-y-4">
            {plan.exercises.map((ex, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-4 p-5 rounded transition-all"
                style={{
                  background: done[i]
                    ? "rgba(57,255,20,0.04)"
                    : "var(--bg-muted)",
                  border: done[i]
                    ? "1px solid rgba(57,255,20,0.15)"
                    : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Done toggle */}
                <button
                  onClick={() => toggleDone(i)}
                  className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: done[i]
                      ? "var(--success)"
                      : "var(--bg-muted-light)",
                    border: done[i]
                      ? "none"
                      : "2px solid rgba(255,255,255,0.12)",
                  }}
                >
                  {done[i] && (
                    <Check size={16} className="text-black" strokeWidth={3} />
                  )}
                </button>

                <div className="flex-1">
                  <p
                    className={`font-heading font-semibold text-base uppercase tracking-wide ${done[i] ? "line-through" : ""}`}
                    style={{
                      color: done[i] ? "var(--text-secondary)" : "white",
                    }}
                  >
                    {ex.name}
                  </p>
                  {ex.notes && (
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      💡 {ex.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-6 text-center">
                  <div>
                    <p className="font-display text-2xl text-white">
                      {ex.sets}
                    </p>
                    <p
                      className="text-xs font-heading tracking-wider uppercase"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      sets
                    </p>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.1)" }}>×</div>
                  <div>
                    <p className="font-display text-2xl text-white">
                      {ex.reps}
                    </p>
                    <p
                      className="text-xs font-heading tracking-wider uppercase"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      reps
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-1 pl-4 border-l"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                  >
                    <Clock
                      size={12}
                      style={{ color: "var(--text-secondary)" }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {ex.rest}s
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </PageWrapper>
  );
}
