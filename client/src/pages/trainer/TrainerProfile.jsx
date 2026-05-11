import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Mail, User, Shield, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store";
import { PageWrapper, SectionHeader } from "../../components/ui";

export default function TrainerProfile() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const copyTrainerId = () => {
    if (user?.trainerId) {
      navigator.clipboard.writeText(user.trainerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Trainer ID copied!");
    }
  };

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <PageWrapper>
      <SectionHeader
        title="Profile"
        sub="Manage your trainer account and settings"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 p-8 rounded"
          style={{
            background: "var(--bg-muted)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h2 className="font-heading font-semibold text-2xl uppercase tracking-wide text-white mb-8">
            Account Information
          </h2>

          <div className="space-y-6">
            {/* Name */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <User size={18} style={{ color: "var(--accent)" }} />
                <label
                  className="font-heading text-xs tracking-widest uppercase"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Full Name
                </label>
              </div>
              <p className="text-lg font-medium text-white">
                {user?.name || "N/A"}
              </p>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="p-4 rounded"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Mail size={18} style={{ color: "var(--accent)" }} />
                <label
                  className="font-heading text-xs tracking-widest uppercase"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Email Address
                </label>
              </div>
              <p className="text-lg font-medium text-white break-all">
                {user?.email || "N/A"}
              </p>
            </motion.div>

            {/* Role */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Shield size={18} style={{ color: "var(--accent)" }} />
                <label
                  className="font-heading text-xs tracking-widest uppercase"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Account Role
                </label>
              </div>
              <div className="inline-block">
                <span
                  className="px-3 py-1 rounded font-heading text-sm uppercase tracking-wider"
                  style={{
                    background: "rgba(255,60,47,0.12)",
                    color: "var(--accent)",
                    border: "1px solid rgba(255,60,47,0.25)",
                  }}
                >
                  ⚡ Trainer
                </span>
              </div>
            </motion.div>

            {/* Join Date */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="p-4 rounded"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Calendar size={18} style={{ color: "var(--accent)" }} />
                <label
                  className="font-heading text-xs tracking-widest uppercase"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Member Since
                </label>
              </div>
              <p className="text-lg font-medium text-white">{joinDate}</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Trainer ID Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-8 rounded flex flex-col justify-between"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,60,47,0.15) 0%, rgba(255,60,47,0.05) 100%)",
            border: "1px solid rgba(255,60,47,0.25)",
            minHeight: "300px",
          }}
        >
          <div>
            <p
              className="font-heading text-xs tracking-widest uppercase mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              Your Unique ID
            </p>
            <h3 className="font-display text-4xl font-bold text-white mb-2 break-all">
              {user?.trainerId || "N/A"}
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Share this ID with members so they can join your training program
            </p>
          </div>

          <button
            onClick={copyTrainerId}
            disabled={!user?.trainerId}
            className="w-full py-3 px-4 rounded font-heading font-semibold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            style={{
              background: copied
                ? "rgba(76,175,80,0.15)"
                : "rgba(255,60,47,0.15)",
              border: `1px solid ${copied ? "rgba(76,175,80,0.3)" : "rgba(255,60,47,0.3)"}`,
              color: copied ? "#4CAF50" : "var(--accent)",
              opacity: !user?.trainerId ? 0.5 : 1,
              cursor: !user?.trainerId ? "not-allowed" : "pointer",
            }}
          >
            {copied ? (
              <>
                <Check size={16} /> Copied!
              </>
            ) : (
              <>
                <Copy size={16} /> Copy ID
              </>
            )}
          </button>
        </motion.div>
      </div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-6 rounded"
        style={{
          background: "rgba(255,60,47,0.05)",
          border: "1px solid rgba(255,60,47,0.15)",
        }}
      >
        <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-white mb-3">
          💡 How to Use Your Trainer ID
        </h3>
        <ul
          className="space-y-2 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          <li>
            ✓ Share your Trainer ID with members who want to join your program
          </li>
          <li>
            ✓ Members will use this ID during registration to connect with you
          </li>
          <li>
            ✓ Each member must have a unique email but can use your Trainer ID
          </li>
          <li>
            ✓ Once connected, you can assign workouts, diets, and send
            broadcasts
          </li>
        </ul>
      </motion.div>
    </PageWrapper>
  );
}
