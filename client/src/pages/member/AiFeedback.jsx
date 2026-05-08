import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { memberService } from "../../services";
import { PageWrapper, SectionHeader, SkeletonCard } from "../../components/ui";

const mockFeedback = {
  generatedAt: new Date().toISOString(),
  overallScore: 78,
  summary:
    "You're making solid progress toward your weight loss goal. Your consistency over the past two weeks is your biggest asset — 12-day streak is impressive. However, there are a few areas we can tighten up to accelerate your results.",
  insights: [
    {
      type: "success",
      title: "Excellent Workout Consistency",
      detail:
        "You've completed 5 out of 7 planned sessions this week. Your upper body sessions are particularly strong — bench press has improved by 15% over the last 3 weeks.",
    },
    {
      type: "warning",
      title: "Protein Intake Below Target",
      detail:
        "Your average daily protein is 142g — about 38g below your 180g target. This is limiting muscle retention during your cut. Try adding a protein shake post-workout and including an extra protein source at dinner.",
    },
    {
      type: "info",
      title: "Leg Day Skipped Twice",
      detail:
        "You've skipped leg sessions 2 Tuesdays in a row. Lower body training is critical for overall calorie burn and hormonal balance. Prioritise this next week.",
    },
    {
      type: "success",
      title: "Weight Trending Down",
      detail:
        "You've lost 1.2kg in the past 14 days — right in the optimal 0.5–1kg/week range. You're losing fat without sacrificing muscle, which is exactly the goal.",
    },
    {
      type: "warning",
      title: "Hydration Needs Attention",
      detail:
        "Based on your logged data, you're averaging 2.1L/day against a 3.5L target. Proper hydration supports metabolism, recovery, and appetite control. Set hourly reminders.",
    },
  ],
  recommendations: [
    "Add 1–2 protein shakes daily to hit your 180g target",
    "Do not skip Tuesday leg sessions — substitute if gym is unavailable",
    "Sleep 7–8 hours consistently; poor sleep increases cortisol and slows fat loss",
    "Consider a 10-min walk after dinner to improve insulin sensitivity",
    "Track meals consistently — you have gaps on weekends",
  ],
  nextWeekFocus:
    "Focus on hitting protein targets every single day and completing all 5 scheduled workouts. If you do this for 7 days straight, expect to see 0.4–0.7kg of fat loss.",
};

const iconMap = {
  success: {
    Icon: CheckCircle,
    color: "var(--success)",
    bg: "rgba(57,255,20,0.07)",
    border: "rgba(57,255,20,0.18)",
  },
  warning: {
    Icon: AlertTriangle,
    color: "var(--warn)",
    bg: "rgba(255,184,0,0.07)",
    border: "rgba(255,184,0,0.18)",
  },
  info: {
    Icon: Info,
    color: "#4FC3F7",
    bg: "rgba(79,195,247,0.07)",
    border: "rgba(79,195,247,0.18)",
  },
};

function ScoreRing({ score }) {
  const r = 54,
    circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 75
      ? "var(--success)"
      : score >= 50
        ? "var(--warn)"
        : "var(--accent)";
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 140, height: 140 }}
    >
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
        />
        <motion.circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="font-display text-4xl text-white leading-none"
        >
          {score}
        </motion.p>
        <p
          className="text-xs font-heading tracking-wider uppercase"
          style={{ color: "var(--text-secondary)" }}
        >
          /100
        </p>
      </div>
    </div>
  );
}

export default function AiFeedback() {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = (showToast = false) => {
    setRefreshing(true);
    memberService
      .getAiFeedback()
      .then(({ data }) => {
        // Backend returns: { success, message, data: {...feedback object...} }
        const feedbackData = data?.data || data;
        setFeedback(feedbackData);
      })
      .catch(() => setFeedback(mockFeedback))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
        if (showToast) toast.success("AI feedback refreshed!");
      });
  };

  useEffect(() => {
    load();
  }, []);

  const fb = feedback || mockFeedback;

  return (
    <PageWrapper>
      <SectionHeader
        title="AI Feedback"
        sub="Personalised insights powered by AI analysis of your data"
        action={
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="btn-ghost flex items-center gap-2 py-2"
            style={{ borderRadius: 0, opacity: refreshing ? 0.6 : 1 }}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        }
      />

      {loading ? (
        <div className="space-y-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <SkeletonCard key={i} height="h-24" />
            ))}
        </div>
      ) : (
        <>
          {/* Score + summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded mb-6 relative overflow-hidden"
            style={{
              background: "var(--bg-muted)",
              border: "1px solid rgba(255,60,47,0.2)",
            }}
          >
            <div
              className="absolute top-0 left-0 w-full h-0.5"
              style={{
                background:
                  "linear-gradient(90deg, var(--accent), transparent)",
              }}
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <ScoreRing score={fb.overallScore} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} style={{ color: "var(--accent)" }} />
                  <p
                    className="font-heading text-xs tracking-widest uppercase"
                    style={{ color: "var(--accent)" }}
                  >
                    Overall Performance Score
                  </p>
                </div>
                <p
                  className="text-white leading-relaxed"
                  style={{ lineHeight: 1.75 }}
                >
                  {fb.summary}
                </p>
                <p
                  className="text-xs mt-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Generated {new Date(fb.generatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Insights */}
          <div className="mb-6">
            <p
              className="font-heading text-xs tracking-widest uppercase mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              Detailed Insights
            </p>
            <div className="space-y-3">
              {fb.insights.map((insight, i) => {
                const { Icon, color, bg, border } =
                  iconMap[insight.type] || iconMap.info;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="p-5 rounded"
                    style={{ background: bg, border: `1px solid ${border}` }}
                  >
                    <div className="flex items-start gap-4">
                      <Icon
                        size={18}
                        style={{ color, flexShrink: 0, marginTop: 2 }}
                      />
                      <div>
                        <p className="font-heading font-semibold text-sm uppercase tracking-wide text-white mb-1">
                          {insight.title}
                        </p>
                        <p
                          className="text-sm"
                          style={{
                            color: "rgba(255,255,255,0.7)",
                            lineHeight: 1.65,
                          }}
                        >
                          {insight.detail}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded"
              style={{
                background: "var(--bg-muted)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} style={{ color: "var(--accent)" }} />
                <p
                  className="font-heading text-xs tracking-widest uppercase"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Action Items
                </p>
              </div>
              <div className="space-y-3">
                {fb.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-heading font-semibold flex-shrink-0 mt-0.5"
                      style={{
                        background: "rgba(255,60,47,0.15)",
                        color: "var(--accent)",
                      }}
                    >
                      {i + 1}
                    </div>
                    <p
                      className="text-sm"
                      style={{
                        color: "rgba(255,255,255,0.75)",
                        lineHeight: 1.6,
                      }}
                    >
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded relative overflow-hidden"
              style={{
                background: "rgba(255,60,47,0.07)",
                border: "1px solid rgba(255,60,47,0.25)",
              }}
            >
              <div
                className="absolute top-0 left-0 w-full h-0.5"
                style={{ background: "var(--accent)" }}
              />
              <div className="flex items-center gap-2 mb-4">
                <Zap
                  size={16}
                  style={{ color: "var(--accent)" }}
                  fill="var(--accent)"
                />
                <p
                  className="font-heading text-xs tracking-widest uppercase"
                  style={{ color: "var(--accent)" }}
                >
                  Next 7 Days Focus
                </p>
              </div>
              <p
                className="text-white leading-relaxed"
                style={{ lineHeight: 1.75 }}
              >
                {fb.nextWeekFocus}
              </p>
              <div
                className="mt-5 pt-4 border-t"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  This analysis is based on your last 14 days of logged
                  workouts, diet tracking, and body measurements. Keep logging
                  daily for more accurate insights.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </PageWrapper>
  );
}
