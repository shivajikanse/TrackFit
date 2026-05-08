import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, Plus, Trash2, Edit3, Save, X, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { memberService } from "../../services";
import { PageWrapper, SectionHeader, EmptyState } from "../../components/ui";

const COLORS = ["#FF3C2F", "#FFB800", "#39FF14", "#4FC3F7", "#A78BFA"];

const mockNotes = [
  {
    _id: "1",
    content:
      "Felt strong on bench today — managed 4×8 at 80kg. Shoulder was a bit tight, need to stretch more before pressing movements.",
    color: "#FF3C2F",
    createdAt: "2025-04-25T08:30:00",
    updatedAt: "2025-04-25T08:30:00",
  },
  {
    _id: "2",
    content:
      "Meal prep Sunday — cook 1.5kg chicken breast, brown rice 500g dry, roast sweet potatoes. Divide into 5 portions. Add lemon + garlic for flavour.",
    color: "#FFB800",
    createdAt: "2025-04-23T18:00:00",
    updatedAt: "2025-04-24T10:00:00",
  },
  {
    _id: "3",
    content:
      "Goal reminder: 83kg by June 1. That's 4 weeks away. Need to stay consistent with diet on weekends — that's where I always slip.",
    color: "#39FF14",
    createdAt: "2025-04-20T20:00:00",
    updatedAt: "2025-04-20T20:00:00",
  },
  {
    _id: "4",
    content:
      "New PR: Deadlift 120kg × 5 reps! Coach doesn't know yet. Will tell him next session. Focus next: improve form on Romanian deadlifts.",
    color: "#4FC3F7",
    createdAt: "2025-04-18T17:00:00",
    updatedAt: "2025-04-18T17:00:00",
  },
];

function NoteCard({ note, onEdit, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="p-5 rounded relative group"
      style={{
        background: "var(--bg-muted)",
        border: `1px solid rgba(255,255,255,0.07)`,
        borderTop: `3px solid ${note.color}`,
      }}
    >
      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: "rgba(255,255,255,0.82)", whiteSpace: "pre-wrap" }}
      >
        {note.content}
      </p>
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {new Date(note.updatedAt || note.createdAt).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric", year: "numeric" },
          )}
        </p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 rounded transition-colors hover:bg-white/10"
            style={{ color: "var(--text-secondary)" }}
          >
            <Edit3 size={13} />
          </button>
          <button
            onClick={() => onDelete(note._id)}
            className="p-1.5 rounded transition-colors hover:bg-red-500/10 hover:text-red-400"
            style={{ color: "var(--text-secondary)" }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function NoteEditor({ note, onSave, onClose }) {
  const [content, setContent] = useState(note?.content || "");
  const [color, setColor] = useState(note?.color || COLORS[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return toast.error("Write something first");
    setSaving(true);
    await onSave({ content, color });
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-5 rounded mb-6"
      style={{
        background: "var(--bg-muted)",
        border: `2px solid ${color}`,
        borderTop: `4px solid ${color}`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="font-heading text-sm uppercase tracking-wider text-white">
          {note?._id ? "Edit Note" : "New Note"}
        </p>
        <button onClick={onClose} style={{ color: "var(--text-secondary)" }}>
          <X size={16} />
        </button>
      </div>
      <textarea
        className="w-full bg-transparent border-none outline-none text-sm resize-none"
        style={{
          color: "rgba(255,255,255,0.85)",
          lineHeight: 1.75,
          minHeight: 120,
        }}
        placeholder="Write your private note here... only you can see this."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        autoFocus
      />
      <div
        className="flex items-center justify-between mt-4 pt-4 border-t"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-2">
          <p
            className="text-xs font-heading tracking-wider uppercase"
            style={{ color: "var(--text-secondary)" }}
          >
            Color:
          </p>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-5 h-5 rounded-full transition-transform hover:scale-110"
              style={{
                background: c,
                outline: color === c ? `2px solid white` : "none",
                outlineOffset: 2,
              }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="btn-ghost py-1.5 px-4 text-xs"
            style={{ borderRadius: 0 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5"
            style={{ borderRadius: 0, opacity: saving ? 0.7 : 1 }}
          >
            <Save size={12} /> {saving ? "Saving..." : "Save Note"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | {} (new) | {note object}
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    memberService
      .getNotes()
      .then(({ data }) => {
        // Backend returns: { success, message, data: [...notes array...] }
        const notesList = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
        setNotes(notesList);
      })
      .catch(() => setNotes(mockNotes))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async ({ content, color }) => {
    try {
      if (editing?._id) {
        await memberService.updateNote(editing._id, { content, color });
        setNotes((prev) =>
          prev.map((n) =>
            n._id === editing._id
              ? { ...n, content, color, updatedAt: new Date().toISOString() }
              : n,
          ),
        );
        toast.success("Note updated!");
      } else {
        const { data } = await memberService.createNote({ content, color });
        const newNote = data.note || {
          _id: Date.now().toString(),
          content,
          color,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setNotes((prev) => [newNote, ...prev]);
        toast.success("Note saved!");
      }
    } catch {
      // Optimistic update on API fail (demo)
      if (!editing?._id) {
        setNotes((prev) => [
          {
            _id: Date.now().toString(),
            content,
            color,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        toast.success("Note saved! (local)");
      } else {
        toast.error("Failed to update note");
      }
    }
    setShowEditor(false);
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this note?")) return;
    setNotes((prev) => prev.filter((n) => n._id !== id));
    try {
      await memberService.deleteNote(id);
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openNew = () => {
    setEditing({});
    setShowEditor(true);
  };
  const openEdit = (note) => {
    setEditing(note);
    setShowEditor(true);
  };
  const closeEditor = () => {
    setEditing(null);
    setShowEditor(false);
  };

  return (
    <PageWrapper>
      <SectionHeader
        title="My Notes"
        sub="Private notes — never visible to your trainer"
        action={
          <button
            onClick={openNew}
            className="btn-primary flex items-center gap-2"
            style={{ borderRadius: 0 }}
          >
            <Plus size={15} /> New Note
          </button>
        }
      />

      {/* Privacy banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 px-4 py-3 rounded mb-6"
        style={{
          background: "rgba(79,195,247,0.06)",
          border: "1px solid rgba(79,195,247,0.15)",
        }}
      >
        <Lock size={14} style={{ color: "#4FC3F7", flexShrink: 0 }} />
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
          These notes are{" "}
          <span style={{ color: "#4FC3F7" }}>completely private</span>. Your
          trainer and no one else can read them.
        </p>
      </motion.div>

      {/* Inline editor */}
      <AnimatePresence>
        {showEditor && (
          <NoteEditor
            note={editing}
            onSave={handleSave}
            onClose={closeEditor}
          />
        )}
      </AnimatePresence>

      {/* Notes grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="skeleton rounded h-40" />
            ))}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No Notes Yet"
          sub="Click 'New Note' to capture your thoughts, goals, or PRs"
        />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </PageWrapper>
  );
}
