import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Apple,
  TrendingUp,
  Zap,
  ChevronRight,
  Flame,
  Target,
} from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { progressService, workoutService, dietService } from "../../services";
import {
  StatCard,
  PageWrapper,
  Badge,
  SkeletonCard,
} from "../../components/ui";
import { useAuthStore } from "../../store";

export default function MemberDashboard() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [todayExercises, setTodayExercises] = useState([]);
  const [planStats, setPlanStats] = useState({
    workoutExercises: 0,
    dietCalories: "—",
    aiFeedback: "New insights available",
  });
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch analytics (includes progress history and stats)
        const analyticsRes = await progressService.getAnalytics();
        const analyticsData = analyticsRes?.data?.data || analyticsRes?.data;
        setAnalytics(analyticsData);

        // Fetch workout plan for today
        try {
          const workoutRes = await workoutService.getMyPlan();
          const workoutPlan = workoutRes?.data?.data || workoutRes?.data;
          if (workoutPlan) {
            const exercises =
              workoutPlan.schedule?.flatMap((day) => day.exercises || []) ||
              workoutPlan.exercises ||
              [];
            setTodayExercises(exercises.slice(0, 4));
            setPlanStats((p) => ({
              ...p,
              workoutExercises: exercises.length,
            }));
          }
        } catch (error) {
          // 404 is OK - user might not have a workout plan yet
          console.log("No workout plan:", error.response?.status);
        }

        // Fetch diet plan
        try {
          const dietRes = await dietService.getMyPlan();
          const dietPlan = dietRes?.data?.data || dietRes?.data;
          if (dietPlan) {
            setPlanStats((p) => ({
              ...p,
              dietCalories: `${dietPlan.targetCalories || 2400} kcal target`,
            }));
          }
        } catch (error) {
          // 404 is OK - user might not have a diet plan yet
          console.log("No diet plan:", error.response?.status);
        }
      } catch (error) {
        console.log("Dashboard data load error:", error.message);
        setAnalytics({
          totalLogs: 0,
          workoutCompletionRate: 0,
          weightHistory: [],
          avgCaloriesConsumed: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = {
    streak: analytics?.totalLogs || 0,
    caloriesBurned: Math.round(analytics?.avgCaloriesConsumed || 0),
    workoutsCompleted: Math.round(analytics?.workoutCompletionRate || 0),
    goalProgress: analytics?.weightChange
      ? Math.abs(parseFloat(analytics.weightChange)) > 0.5
        ? 50 + Math.min(50, Math.round(parseFloat(analytics.weightChange) * 10))
        : 50
      : 0,
  };

  const chartData = analytics?.weightHistory
    ? analytics.weightHistory.slice(-7).map((entry) => ({
        date: new Date(entry.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        weight: entry.weight,
      }))
    : [{ date: "No data", weight: 0 }];

  return (
    <PageWrapper>
      <div className="mb-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-heading text-xs tracking-widest uppercase mb-1"
          style={{ color: "var(--accent)" }}
        >
          Keep pushing
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-white"
          style={{ fontSize: "48px", lineHeight: 1 }}
        >
          HEY, {(user?.name || "CHAMP").split(" ")[0].toUpperCase()}!
        </motion.h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => <SkeletonCard key={i} height="h-28" />)
        ) : (
          <>
            <StatCard
              label="Day Streak"
              value={`${stats.streak}🔥`}
              sub="Keep it up!"
              icon={Flame}
              accent
              index={0}
            />
            <StatCard
              label="Workouts Done"
              value={stats.workoutsCompleted}
              sub="This month"
              icon={Dumbbell}
              index={1}
            />
            <StatCard
              label="Calories Burned"
              value={`${stats.caloriesBurned}`}
              sub="This week"
              icon={Target}
              index={2}
            />
            <StatCard
              label="Goal Progress"
              value={`${stats.goalProgress}%`}
              sub="Overall"
              icon={TrendingUp}
              index={3}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 p-6 rounded"
          style={{
            background: "var(--bg-muted)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p
                className="font-heading text-xs tracking-widest uppercase mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Weight
              </p>
              <h3 className="font-heading font-semibold text-lg text-white uppercase">
                7-Day Progress
              </h3>
            </div>
            <Link
              to="/member/progress"
              className="text-xs font-heading tracking-wider uppercase"
              style={{ color: "var(--accent)" }}
            >
              View All →
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#39FF14" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#39FF14" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: "#666", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1A1A1A",
                  border: "1px solid rgba(57,255,20,0.2)",
                  borderRadius: "4px",
                }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#39FF14"
                strokeWidth={2}
                fill="url(#wg)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quick nav */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded space-y-3"
          style={{
            background: "var(--bg-muted)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-white mb-4">
            My Plans
          </h3>
          {[
            {
              to: "/member/workout",
              icon: Dumbbell,
              label: "Today's Workout",
              sub:
                planStats.workoutExercises > 0
                  ? `${planStats.workoutExercises} exercises ready`
                  : "No workout assigned",
            },
            {
              to: "/member/diet",
              icon: Apple,
              label: "My Diet Plan",
              sub: planStats.dietCalories,
            },
            {
              to: "/member/ai-feedback",
              icon: Zap,
              label: "AI Feedback",
              sub: planStats.aiFeedback,
            },
          ].map(({ to, icon: Icon, label, sub }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 p-3 rounded transition-all hover:border-red-500/20"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div
                className="p-2 rounded"
                style={{ background: "rgba(255,60,47,0.1)" }}
              >
                <Icon size={15} style={{ color: "var(--accent)" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{label}</p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {sub}
                </p>
              </div>
              <ChevronRight
                size={14}
                style={{ color: "var(--text-secondary)" }}
              />
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Today's workout preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-6 rounded"
        style={{
          background: "var(--bg-muted)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p
              className="font-heading text-xs tracking-widest uppercase mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Today
            </p>
            <h3 className="font-heading font-semibold text-lg text-white uppercase">
              Workout Plan
            </h3>
          </div>
          <Link
            to="/member/workout"
            className="text-xs font-heading tracking-wider uppercase"
            style={{ color: "var(--accent)" }}
          >
            Full Plan →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {todayExercises.length > 0 ? (
            todayExercises.map((ex, i) => (
              <motion.div
                key={ex.name || i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 + i * 0.06 }}
                className="p-4 rounded relative overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <Dumbbell
                    size={14}
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  />
                  <Badge variant="default">Pending</Badge>
                </div>
                <p className="font-heading text-sm font-semibold text-white uppercase">
                  {ex.name}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {ex.sets} × {ex.reps} reps
                </p>
              </motion.div>
            ))
          ) : (
            <div
              className="col-span-full p-8 rounded text-center"
              style={{
                background: "rgba(255,60,47,0.05)",
                border: "1px solid rgba(255,60,47,0.15)",
              }}
            >
              <Dumbbell
                size={32}
                style={{
                  color: "var(--text-secondary)",
                  margin: "0 auto 12px",
                }}
              />
              <p className="text-sm text-white font-medium">
                No workout assigned yet
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Your trainer will assign a workout plan soon
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </PageWrapper>
  );
}
