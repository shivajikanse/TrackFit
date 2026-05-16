import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Dumbbell, Apple, TrendingUp } from "lucide-react";
import { trainerService } from "../../services";
import { PageWrapper, Badge, SkeletonCard } from "../../components/ui";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
} from "recharts";

export default function MemberDetail() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch member details only when component mounts
  useEffect(() => {
    if (!id) {
      setError("Invalid member ID");
      setLoading(false);
      return;
    }

    const fetchMember = async () => {
      try {
        const response = await trainerService.getMember(id);
        const responseData = response?.data;

        if (responseData?.success) {
          const memberData = responseData.data?.member || responseData.data;
          setMember(memberData);
          setError(null);
        } else {
          setMember(null);
          setError(responseData?.message || "Failed to load member");
        }
      } catch (err) {
        setMember(null);
        setError(
          err?.response?.data?.message || "Failed to load member details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  if (loading)
    return (
      <PageWrapper>
        <div className="space-y-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <SkeletonCard key={i} height="h-24" />
            ))}
        </div>
      </PageWrapper>
    );

  if (error)
    return (
      <PageWrapper>
        <div
          className="p-6 rounded text-center"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgb(239, 68, 68)",
          }}
        >
          <p className="text-red-400 font-medium mb-3">{error}</p>
          <Link
            to="/trainer/members"
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            ← Back to Members
          </Link>
        </div>
      </PageWrapper>
    );

  if (!member) return null;
  const m = member;

  return (
    <PageWrapper>
      <Link
        to="/trainer/members"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:text-white"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowLeft size={14} /> Back to Members
      </Link>

      {/* Header */}
      <div
        className="flex items-start gap-5 mb-8 p-6 rounded"
        style={{
          background: "var(--bg-muted)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="w-16 h-16 rounded flex items-center justify-center font-display text-3xl flex-shrink-0"
          style={{ background: "rgba(255,60,47,0.12)", color: "var(--accent)" }}
        >
          {m.name?.[0]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-heading font-semibold text-2xl uppercase tracking-wide text-white">
              {m.name}
            </h1>
            <Badge variant={m.status === "active" ? "success" : "warn"}>
              {m.status}
            </Badge>
          </div>
          <p
            className="text-sm mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            {m.email}
          </p>
          <div className="flex gap-6">
            {[
              ["Goal", m.goal?.replace("_", " ")],
              ["Age", `${m.stats?.age}y`],
              ["Weight", `${m.stats?.weight}kg`],
              ["Height", `${m.stats?.height}cm`],
            ].map(([l, v]) => (
              <div key={l}>
                <p
                  className="text-xs font-heading tracking-wider uppercase"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {l}
                </p>
                <p className="text-sm font-medium text-white capitalize">{v}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="text-right">
          <p
            className="font-display text-4xl"
            style={{ color: "var(--accent)" }}
          >
            {m.stats?.progress}%
          </p>
          <p
            className="text-xs font-heading tracking-wider uppercase"
            style={{ color: "var(--text-secondary)" }}
          >
            Overall Progress
          </p>
        </div>
      </div>

      {/* Weight progress chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div
          className="p-6 rounded"
          style={{
            background: "var(--bg-muted)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-white mb-4">
            Weight Trend
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={m.weeklyProgress || []}>
              <XAxis
                dataKey="week"
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
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#FF3C2F"
                strokeWidth={2}
                dot={{ fill: "#FF3C2F", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div
          className="p-6 rounded space-y-4"
          style={{
            background: "var(--bg-muted)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-white mb-2">
            Quick Actions
          </h3>
          {[
            {
              to: `/trainer/plans?member=${id}`,
              icon: Dumbbell,
              label: "Assign Workout Plan",
              desc: "Create or update workout",
            },
            {
              to: `/trainer/plans?member=${id}&tab=diet`,
              icon: Apple,
              label: "Assign Diet Plan",
              desc: "Set nutritional goals",
            },
            {
              to: `/trainer/broadcast`,
              icon: TrendingUp,
              label: "Send Personal Message",
              desc: "Direct communication",
            },
          ].map(({ to, icon: Icon, label, desc }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 p-3 rounded transition-colors hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="p-2 rounded"
                style={{ background: "rgba(255,60,47,0.1)" }}
              >
                <Icon size={16} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
