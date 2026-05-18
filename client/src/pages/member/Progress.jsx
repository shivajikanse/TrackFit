import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingDown, Dumbbell, Flame, Plus } from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import toast from "react-hot-toast";
import { progressService } from "../../services";
import {
  PageWrapper,
  SectionHeader,
  StatCard,
  Input,
  Select,
  Modal,
} from "../../components/ui";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded text-sm"
      style={{
        background: "#1A1A1A",
        border: "1px solid rgba(255,60,47,0.25)",
      }}
    >
      <p
        className="font-heading text-xs tracking-wider uppercase mb-1"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="text-white font-medium">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function Progress() {
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logModal, setLogModal] = useState(false);
  const [logForm, setLogForm] = useState({
    weight: "",
    calories: "",
    workoutDone: "yes",
    notes: "",
  });
  const [logging, setLogging] = useState(false);
  const [activeChart, setActiveChart] = useState("weight");

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        const analyticsRes = await progressService.getAnalytics();
        const analyticsData = analyticsRes?.data?.data || analyticsRes?.data;
        setAnalytics(analyticsData);

        const historyRes = await progressService.getHistory();
        const historyData = historyRes?.data?.data || historyRes?.data;
        if (Array.isArray(historyData)) {
          setHistory(historyData);
        }
      } catch (error) {
        console.log("Progress load error:", error.message);
        setAnalytics({
          totalLogs: 0,
          workoutCompletionRate: 0,
          weightHistory: [],
          avgCaloriesConsumed: 0,
          weightChange: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  const handleLog = async (e) => {
    e.preventDefault();
    setLogging(true);
    try {
      await progressService.logProgress({
        weight: parseFloat(logForm.weight),
        caloriesConsumed: parseInt(logForm.calories),
        workoutCompleted: logForm.workoutDone === "yes",
        notes: logForm.notes,
        date: new Date().toISOString(),
      });
      toast.success("Progress logged!");
      setLogModal(false);
      setLogForm({ weight: "", calories: "", workoutDone: "yes", notes: "" });
    } catch {
      toast.error("Failed to log progress");
    } finally {
      setLogging(false);
    }
  };

  return (
    <PageWrapper>
      <SectionHeader
        title="Progress Tracker"
        sub="Your fitness journey visualised"
        action={
          <button
            onClick={() => setLogModal(true)}
            className="btn-primary flex items-center gap-2"
            style={{ borderRadius: 0 }}
          >
            <Plus size={15} /> Log Today
          </button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Logs"
          value={`${analytics?.totalLogs || 0}📊`}
          icon={Flame}
          index={0}
        />
        <StatCard
          label="Workout Completion"
          value={`${Math.round(analytics?.workoutCompletionRate || 0)}%`}
          icon={Dumbbell}
          index={1}
        />
        <StatCard
          label="Avg Calories"
          value={`${Math.round(analytics?.avgCaloriesConsumed || 0)}`}
          sub="Per log"
          icon={Flame}
          index={2}
        />
        <StatCard
          label="Weight Change"
          value={`${analytics?.weightChange || 0}kg`}
          icon={TrendingDown}
          index={3}
        />
      </div>

      {/* Chart tabs */}
      <div
        className="flex gap-0 mb-6 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        {[
          { id: "weight", label: "Weight Trend" },
          { id: "calories", label: "Calories" },
          { id: "workouts", label: "Workout Sessions" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveChart(id)}
            className="px-5 py-3 font-heading text-sm tracking-wider uppercase transition-all relative"
            style={{
              color:
                activeChart === id ? "var(--accent)" : "var(--text-secondary)",
            }}
          >
            {label}
            {activeChart === id && (
              <motion.div
                layoutId="prog-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: "var(--accent)" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Charts */}
      <motion.div
        key={activeChart}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded mb-6"
        style={{
          background: "var(--bg-muted)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {activeChart === "weight" && (
          <>
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <p
                  className="font-heading text-xs tracking-widest uppercase mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Weight (kg)
                </p>
                <p className="font-display text-4xl text-white">
                  {analytics?.weightHistory?.length > 0
                    ? analytics.weightHistory[
                        analytics.weightHistory.length - 1
                      ].weight
                    : "—"}
                  {analytics?.weightChange && (
                    <span
                      className="text-lg ml-2"
                      style={{ color: "var(--success)" }}
                    >
                      ↓ {analytics.weightChange}kg total
                    </span>
                  )}
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={
                  analytics?.weightHistory?.map((w) => ({
                    date: new Date(w.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    }),
                    weight: w.weight,
                  })) || [{ date: "No data", weight: 0 }]
                }
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#39FF14" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#39FF14" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#666", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={["dataMin - 1", "dataMax + 1"]}
                  tick={{ fill: "#666", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="weight"
                  name="Weight (kg)"
                  stroke="#39FF14"
                  strokeWidth={2.5}
                  fill="url(#wGrad)"
                  dot={{ fill: "#39FF14", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}

        {activeChart === "calories" && (
          <>
            <p
              className="font-heading text-xs tracking-widest uppercase mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Weekly Calorie Balance
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={
                  history.slice(-7).map((entry, idx) => ({
                    date: new Date(entry.date).toLocaleDateString("en-US", {
                      weekday: "short",
                    }),
                    intake: entry.caloriesConsumed || 0,
                    burned: Math.round((entry.caloriesConsumed || 0) * 0.2), // Approximate
                  })) || [{ date: "No data", intake: 0, burned: 0 }]
                }
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#666", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#666", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontFamily: "DM Sans",
                    fontSize: 12,
                    color: "#888",
                  }}
                />
                <Bar
                  dataKey="intake"
                  name="Intake (kcal)"
                  fill="rgba(255,184,0,0.6)"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="burned"
                  name="Burned (kcal)"
                  fill="rgba(255,60,47,0.7)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        {activeChart === "workouts" && (
          <>
            <p
              className="font-heading text-xs tracking-widest uppercase mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Weekly Session Count
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={
                  history.slice(-7).map((entry, idx) => ({
                    week: `Wk ${idx + 1}`,
                    sessions: entry.workoutCompleted ? 1 : 0,
                  })) || [{ week: "No data", sessions: 0 }]
                }
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "#666", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#666", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="sessions"
                  name="Sessions"
                  fill="var(--accent)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </motion.div>

      {/* Log Progress Modal */}
      <Modal
        open={logModal}
        onClose={() => setLogModal(false)}
        title="Log Today's Progress"
      >
        <form onSubmit={handleLog} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Current Weight (kg)"
              type="number"
              step="0.1"
              placeholder="86.5"
              value={logForm.weight}
              onChange={(e) =>
                setLogForm((p) => ({ ...p, weight: e.target.value }))
              }
            />
            <Input
              label="Calories Consumed"
              type="number"
              placeholder="2400"
              value={logForm.calories}
              onChange={(e) =>
                setLogForm((p) => ({ ...p, calories: e.target.value }))
              }
            />
          </div>
          <Select
            label="Workout Completed Today?"
            value={logForm.workoutDone}
            onChange={(e) =>
              setLogForm((p) => ({ ...p, workoutDone: e.target.value }))
            }
          >
            <option value="yes">✅ Yes, completed!</option>
            <option value="no">❌ No, rest day</option>
            <option value="partial">⚡ Partial workout</option>
          </Select>
          <div className="space-y-1.5">
            <label
              className="block text-xs font-heading tracking-widest uppercase"
              style={{ color: "var(--text-secondary)" }}
            >
              Notes (optional)
            </label>
            <textarea
              className="input-dark rounded resize-none"
              rows={3}
              placeholder="How did today feel? Any PRs?"
              value={logForm.notes}
              onChange={(e) =>
                setLogForm((p) => ({ ...p, notes: e.target.value }))
              }
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setLogModal(false)}
              className="btn-ghost flex-1"
              style={{ borderRadius: 0 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={logging}
              className="btn-primary flex-1"
              style={{ borderRadius: 0, opacity: logging ? 0.7 : 1 }}
            >
              {logging ? "Saving..." : "Log Progress"}
            </button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
