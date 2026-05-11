import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Dumbbell,
  TrendingUp,
  Send,
  ChevronRight,
  Activity,
  Copy,
  Check,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { trainerService } from "../../services";
import {
  StatCard,
  SkeletonCard,
  PageWrapper,
  Badge,
} from "../../components/ui";
import { useAuthStore } from "../../store";

const mockStats = {
  totalMembers: 24,
  activePlans: 18,
  broadcastsSent: 7,
  avgProgress: 78,
};
const mockActivity = [
  { day: "Mon", sessions: 12 },
  { day: "Tue", sessions: 19 },
  { day: "Wed", sessions: 15 },
  { day: "Thu", sessions: 22 },
  { day: "Fri", sessions: 28 },
  { day: "Sat", sessions: 20 },
  { day: "Sun", sessions: 14 },
];
const mockMembers = [
  {
    _id: "1",
    name: "Alex Johnson",
    goal: "Weight Loss",
    progress: 82,
    status: "active",
  },
  {
    _id: "2",
    name: "Sarah Chen",
    goal: "Muscle Gain",
    progress: 67,
    status: "active",
  },
  {
    _id: "3",
    name: "Marcus Davis",
    goal: "Endurance",
    progress: 91,
    status: "active",
  },
  {
    _id: "4",
    name: "Emma Wilson",
    goal: "Toning",
    progress: 45,
    status: "pending",
  },
];

export default function TrainerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    trainerService
      .getDashboard()
      .then(({ data }) => {
        // Backend returns: { success, message, data: {...stats...} }
        const statsData = data?.data || data;
        setStats(statsData);
      })
      .catch(() => setStats(mockStats))
      .finally(() => setLoading(false));
  }, []);

  const copyTrainerId = () => {
    if (user?.trainerId) {
      navigator.clipboard.writeText(user.trainerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const s = stats || mockStats;

  return (
    <PageWrapper>
      {/* Welcome */}
      <div className="mb-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-heading text-xs tracking-widest uppercase mb-1"
          style={{ color: "var(--accent)" }}
        >
          Welcome back
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-white"
          style={{ fontSize: "52px", lineHeight: 1 }}
        >
          COACH {(user?.name || "TRAINER").toUpperCase()}
        </motion.h1>
      </div>

      {/* Trainer ID Card */}
      {user?.trainerId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-5 rounded flex items-center justify-between"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,60,47,0.1) 0%, rgba(255,60,47,0.05) 100%)",
            border: "1px solid rgba(255,60,47,0.25)",
          }}
        >
          <div>
            <p
              className="font-heading text-xs tracking-widest uppercase mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Your Trainer ID
            </p>
            <p className="font-heading text-lg font-semibold text-white">
              {user.trainerId}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Share this ID with members to join your training program
            </p>
          </div>
          <button
            onClick={copyTrainerId}
            className="ml-4 flex-shrink-0 p-3 rounded transition-all"
            style={{
              background: copied
                ? "rgba(76,175,80,0.15)"
                : "rgba(255,60,47,0.15)",
              border: `1px solid ${copied ? "rgba(76,175,80,0.3)" : "rgba(255,60,47,0.3)"}`,
              color: copied ? "#4CAF50" : "var(--accent)",
            }}
            title="Copy Trainer ID"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => <SkeletonCard key={i} height="h-28" />)
        ) : (
          <>
            <StatCard
              label="Total Members"
              value={s.totalMembers}
              sub="+3 this week"
              icon={Users}
              accent
              index={0}
            />
            <StatCard
              label="Active Plans"
              value={s.activePlans}
              sub="Workout + Diet"
              icon={Dumbbell}
              index={1}
            />
            <StatCard
              label="Avg Progress"
              value={`${s.avgProgress}%`}
              sub="Across all members"
              icon={TrendingUp}
              index={2}
            />
            <StatCard
              label="Broadcasts Sent"
              value={s.broadcastsSent}
              sub="This month"
              icon={Send}
              index={3}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 p-6 rounded"
          style={{
            background: "var(--bg-muted)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p
                className="font-heading text-xs tracking-widest uppercase mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Weekly Sessions
              </p>
              <h3 className="font-heading font-semibold text-lg text-white uppercase">
                Activity Overview
              </h3>
            </div>
            <Activity size={18} style={{ color: "var(--accent)" }} />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockActivity}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF3C2F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF3C2F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fill: "#666", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#666", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1A1A1A",
                  border: "1px solid rgba(255,60,47,0.2)",
                  borderRadius: "4px",
                }}
              />
              <Area
                type="monotone"
                dataKey="sessions"
                stroke="#FF3C2F"
                strokeWidth={2}
                fill="url(#g1)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-6 rounded"
          style={{
            background: "var(--bg-muted)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            {[
              { to: "/trainer/members", label: "Add Member", icon: Users },
              { to: "/trainer/plans", label: "Assign Plan", icon: Dumbbell },
              { to: "/trainer/broadcast", label: "Send Broadcast", icon: Send },
            ].map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center justify-between p-3 rounded transition-all hover:border-red-500/30"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} style={{ color: "var(--accent)" }} />
                  <span className="text-sm font-medium text-white">
                    {label}
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  style={{ color: "var(--text-secondary)" }}
                />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Members table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mt-6 rounded overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            background: "rgba(255,255,255,0.02)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-white">
            Recent Members
          </h3>
          <Link
            to="/trainer/members"
            className="text-xs font-heading tracking-wider uppercase"
            style={{ color: "var(--accent)" }}
          >
            View All →
          </Link>
        </div>
        <div>
          {mockMembers.map((m, i) => (
            <Link
              key={m._id}
              to={`/trainer/members/${m._id}`}
              className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/3"
              style={{
                borderBottom:
                  i < mockMembers.length - 1
                    ? "1px solid rgba(255,255,255,0.04)"
                    : "none",
              }}
            >
              <div
                className="w-9 h-9 rounded flex items-center justify-center font-heading font-semibold text-sm flex-shrink-0"
                style={{
                  background: "rgba(255,60,47,0.12)",
                  color: "var(--accent)",
                }}
              >
                {m.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{m.name}</p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {m.goal}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:block w-24">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ background: "var(--bg-muted-light)" }}
                  >
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${m.progress}%`,
                        background:
                          m.progress > 70 ? "var(--success)" : "var(--accent)",
                      }}
                    />
                  </div>
                  <p
                    className="text-xs mt-1 text-right"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {m.progress}%
                  </p>
                </div>
                <Badge variant={m.status === "active" ? "success" : "warn"}>
                  {m.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </PageWrapper>
  );
}
