import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Radio, Users, Clock, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { trainerService } from "../../services";
import { useAuthStore } from "../../store";
import {
  PageWrapper,
  SectionHeader,
  Textarea,
  Badge,
} from "../../components/ui";

export default function Broadcast() {
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("broadcast"); // broadcast | selected
  const [sending, setSending] = useState(false);
  const [sentMessages, setSentMessages] = useState([]);
  const [copied, setCopied] = useState(false);
  const { user } = useAuthStore();

  // Fetch members and messages once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersResponse, messagesResponse] = await Promise.all([
          trainerService.getMembers(),
          trainerService.getSentMessages(),
        ]);

        // Handle members
        const membersData = membersResponse?.data;
        if (membersData?.success && Array.isArray(membersData?.data)) {
          setMembers(membersData.data);
        }

        // Handle messages
        const messagesData = messagesResponse?.data;
        if (messagesData?.success) {
          const messagesList = Array.isArray(messagesData?.data)
            ? messagesData.data
            : Array.isArray(messagesData?.messages)
              ? messagesData.messages
              : [];
          setSentMessages(messagesList);
        }
      } catch (error) {
        console.error("[Broadcast] Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const toggleMember = (id) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  const copyTrainerId = () => {
    if (user?.trainerId) {
      navigator.clipboard.writeText(user.trainerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const send = async () => {
    if (!message.trim()) return toast.error("Write a message first");
    if (mode === "selected" && selected.length === 0)
      return toast.error("Select at least one member");
    setSending(true);
    try {
      const payload = {
        title: "Message",
        message: message,
        category: "announcement",
      };

      if (mode === "selected") {
        payload.recipientIds = selected;
      }

      await trainerService.broadcast(payload);

      const newMsg = {
        _id: Date.now().toString(),
        type: mode,
        message,
        sentAt: new Date().toISOString(),
        readCount: 0,
      };
      setSentMessages((p) => [newMsg, ...p]);
      setMessage("");
      setSelected([]);
      toast.success(
        mode === "broadcast"
          ? "Broadcast sent to all members!"
          : `Message sent to ${selected.length} member(s)!`,
      );
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageWrapper>
      <SectionHeader
        title="Broadcast"
        sub="Send messages to all or selected members"
      />

      {/* Trainer ID Card */}
      {user?.trainerId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 p-4 rounded flex items-center justify-between"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,60,47,0.1) 0%, rgba(255,60,47,0.05) 100%)",
            border: "1px solid rgba(255,60,47,0.25)",
          }}
        >
          <div className="flex-1">
            <p
              className="font-heading text-xs tracking-widest uppercase mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Share Your Trainer ID
            </p>
            <p className="font-heading text-base font-semibold text-white">
              {user.trainerId}
            </p>
          </div>
          <button
            onClick={copyTrainerId}
            className="ml-4 flex-shrink-0 p-2 rounded transition-all"
            style={{
              background: copied
                ? "rgba(76,175,80,0.15)"
                : "rgba(255,60,47,0.15)",
              border: `1px solid ${copied ? "rgba(76,175,80,0.3)" : "rgba(255,60,47,0.3)"}`,
              color: copied ? "#4CAF50" : "var(--accent)",
            }}
            title="Copy Trainer ID"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Compose */}
        <div className="lg:col-span-3 space-y-5">
          <div
            className="p-6 rounded"
            style={{
              background: "var(--bg-muted)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-white mb-5">
              Compose Message
            </h3>

            {/* Mode toggle */}
            <div className="flex gap-3 mb-5">
              {[
                { id: "broadcast", icon: Radio, label: "All Members" },
                { id: "selected", icon: Users, label: "Selected" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded font-heading text-sm uppercase tracking-wider transition-all"
                  style={
                    mode === id
                      ? {
                          background: "rgba(255,60,47,0.12)",
                          color: "var(--accent)",
                          border: "1px solid rgba(255,60,47,0.25)",
                        }
                      : {
                          background: "rgba(255,255,255,0.03)",
                          color: "var(--text-secondary)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }
                  }
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>

            {/* Member select (shown when mode = selected) */}
            {mode === "selected" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-5"
              >
                <p
                  className="text-xs font-heading tracking-widest uppercase mb-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Select Recipients
                </p>
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => (
                    <button
                      key={m._id}
                      onClick={() => toggleMember(m._id)}
                      className="px-3 py-1.5 rounded text-sm transition-all"
                      style={
                        selected.includes(m._id)
                          ? {
                              background: "rgba(255,60,47,0.15)",
                              color: "var(--accent)",
                              border: "1px solid rgba(255,60,47,0.3)",
                            }
                          : {
                              background: "rgba(255,255,255,0.04)",
                              color: "var(--text-secondary)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }
                      }
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <Textarea
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message to members..."
              rows={5}
            />
            <p
              className="text-xs mt-1 text-right"
              style={{ color: "var(--text-secondary)" }}
            >
              {message.length}/500
            </p>

            <button
              onClick={send}
              disabled={sending}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-4"
              style={{ borderRadius: 0, opacity: sending ? 0.7 : 1 }}
            >
              <Send size={16} />
              {sending
                ? "Sending..."
                : mode === "broadcast"
                  ? "Send to All Members"
                  : `Send to ${selected.length} Member(s)`}
            </button>
          </div>
        </div>

        {/* Sent history */}
        <div className="lg:col-span-2">
          <div
            className="p-6 rounded"
            style={{
              background: "var(--bg-muted)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-white mb-5">
              Sent Messages
            </h3>
            <div className="space-y-4">
              {sentMessages.map((msg, i) => (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-4 rounded"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant={msg.type === "broadcast" ? "accent" : "warn"}
                    >
                      {msg.type === "broadcast" ? "All" : "Selected"}
                    </Badge>
                    <span
                      className="text-xs flex items-center gap-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Clock size={10} />
                      {new Date(msg.sentAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p
                    className="text-sm mb-2"
                    style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}
                  >
                    {msg.message}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Read by {msg.readCount} member(s)
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
