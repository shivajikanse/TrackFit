import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox as InboxIcon,
  Radio,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { memberService } from "../../services";
import {
  PageWrapper,
  SectionHeader,
  EmptyState,
  Badge,
} from "../../components/ui";

const mockMessages = [
  {
    _id: "1",
    type: "broadcast",
    from: "Coach Mike",
    subject: "Double Session This Friday!",
    message:
      "Hey team! Since the gym will be closed on Saturday for maintenance, we're doing a double session this Friday at 6 PM. Both strength AND cardio blocks. Come fuelled and rested. See you there 💪",
    sentAt: "2025-04-25T09:00:00",
    read: false,
  },
  {
    _id: "2",
    type: "personal",
    from: "Coach Mike",
    subject: "New Leg Day Routine Uploaded",
    message:
      "Hey! I've updated your Tuesday leg day with some new compound movements. Check your workout plan — I've added Romanian deadlifts and Bulgarian split squats. These will really accelerate your lower body development. Let me know how the first session feels.",
    sentAt: "2025-04-23T14:30:00",
    read: true,
  },
  {
    _id: "3",
    type: "broadcast",
    from: "Coach Mike",
    subject: "AI Diet Plans Are Live 🤖",
    message:
      "Big update! I've used our AI system to generate personalised diet plans for everyone based on your goals and body stats. Head to your Diet section to check it out. These are starting points — I'll tweak them based on your feedback after the first week.",
    sentAt: "2025-04-20T11:00:00",
    read: true,
  },
  {
    _id: "4",
    type: "personal",
    from: "Coach Mike",
    subject: "Great Progress This Month!",
    message:
      "Just reviewed your last 4 weeks of data. You're down 2.1kg and your strength numbers are up across the board. Especially impressed with your bench progress. Keep this consistency going — you're ahead of schedule for your June target. Proud of the work.",
    sentAt: "2025-04-15T16:00:00",
    read: true,
  },
  {
    _id: "5",
    type: "broadcast",
    from: "Coach Mike",
    subject: "Reminder: Log Your Daily Progress",
    message:
      "Quick reminder to all members — please log your weight and meals daily in the Progress section. I can only give you accurate AI feedback and adjust your plans if I have consistent data. Even a 30-second log each morning makes a huge difference.",
    sentAt: "2025-04-10T08:00:00",
    read: true,
  },
];

function MessageCard({ msg, isOpen, onToggle }) {
  const timeStr = new Date(msg.sentAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded overflow-hidden"
      style={{
        border: isOpen
          ? "1px solid rgba(255,60,47,0.25)"
          : msg.read
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(255,60,47,0.2)",
        background: isOpen ? "rgba(255,60,47,0.04)" : "var(--bg-muted)",
      }}
    >
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/3"
      >
        {/* Unread dot */}
        <div
          className="flex-shrink-0 w-2 h-2 rounded-full"
          style={{
            background: msg.read ? "transparent" : "var(--accent)",
            boxShadow: msg.read ? "none" : "0 0 6px var(--accent)",
          }}
        />

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded flex items-center justify-center font-heading font-semibold text-sm flex-shrink-0"
          style={{ background: "rgba(255,60,47,0.12)", color: "var(--accent)" }}
        >
          {msg.from?.[0] || "T"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-sm font-medium text-white">{msg.from}</span>
            <Badge variant={msg.type === "broadcast" ? "accent" : "warn"}>
              {msg.type === "broadcast" ? (
                <>
                  <Radio size={10} className="inline mr-1" />
                  Broadcast
                </>
              ) : (
                <>
                  <User size={10} className="inline mr-1" />
                  Personal
                </>
              )}
            </Badge>
          </div>
          <p
            className={`text-sm truncate ${msg.read ? "" : "font-medium"}`}
            style={{ color: msg.read ? "var(--text-secondary)" : "white" }}
          >
            {msg.subject}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className="hidden sm:flex items-center gap-1 text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            <Clock size={11} /> {timeStr}
          </span>
          <span style={{ color: "var(--text-secondary)" }}>
            {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </div>
      </button>

      {/* Expanded message */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="px-5 pb-5 pt-2 border-t"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-heading font-semibold text-base uppercase tracking-wide text-white">
                    {msg.subject}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    From {msg.from} · {new Date(msg.sentAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.8 }}
              >
                {msg.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Inbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState("all"); // all | broadcast | personal | unread

  useEffect(() => {
    memberService
      .getInbox()
      .then(({ data }) => {
        // Backend returns: { success, message, data: [...messages array...] }
        const messagesList = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
        setMessages(messagesList);
      })
      .catch(() => setMessages(mockMessages))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
    // Mark as read
    setMessages((prev) =>
      prev.map((m) => (m._id === id ? { ...m, read: true } : m)),
    );
  };

  const filtered = messages.filter((m) => {
    if (filter === "broadcast") return m.type === "broadcast";
    if (filter === "personal") return m.type === "personal";
    if (filter === "unread") return !m.read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <PageWrapper>
      <SectionHeader
        title="Inbox"
        sub={`Messages from your trainer${unreadCount > 0 ? ` · ${unreadCount} unread` : ""}`}
      />

      {/* Filter tabs */}
      <div
        className="flex gap-0 mb-6 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        {[
          { id: "all", label: `All (${messages.length})` },
          {
            id: "unread",
            label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`,
          },
          { id: "personal", label: "Personal" },
          { id: "broadcast", label: "Broadcast" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className="px-4 py-2.5 font-heading text-xs tracking-widest uppercase transition-all relative"
            style={{
              color: filter === id ? "var(--accent)" : "var(--text-secondary)",
            }}
          >
            {label}
            {filter === id && (
              <motion.div
                layoutId="inbox-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: "var(--accent)" }}
              />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="skeleton rounded h-16"
                style={{ opacity: 1 - i * 0.15 }}
              />
            ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title={filter === "unread" ? "All Caught Up!" : "No Messages"}
          sub={
            filter === "unread"
              ? "No unread messages"
              : "Your trainer hasn't sent any messages yet"
          }
        />
      ) : (
        <motion.div layout className="space-y-3">
          <AnimatePresence>
            {filtered.map((msg, i) => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <MessageCard
                  msg={msg}
                  isOpen={openId === msg._id}
                  onToggle={() => toggle(msg._id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </PageWrapper>
  );
}
