import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Search, Trash2, Eye, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { trainerService } from "../../services";
import {
  PageWrapper,
  SectionHeader,
  Badge,
  Modal,
  Input,
  Select,
  EmptyState,
  SkeletonList,
} from "../../components/ui";

export default function MembersList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    email: "",
  });
  const [adding, setAdding] = useState(false);

  // Direct API call to test
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await trainerService.getMembers();
        const responseData = response?.data;

        if (responseData?.success && Array.isArray(responseData?.data)) {
          setMembers(responseData.data);
          setError(null);
        } else {
          setMembers([]);
          setError("Failed to load members");
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load members");
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filtered =
    Array.isArray(members) && members.length > 0
      ? members.filter(
          (m) =>
            m.name?.toLowerCase().includes(search.toLowerCase()) ||
            m.email?.toLowerCase().includes(search.toLowerCase()),
        )
      : [];

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const response = await trainerService.addMember(newMember);
      // Backend returns: { success: true, data: {...member}, message: "..." }
      const memberData = response?.data?.data;
      if (memberData) {
        setMembers((prev) => [...prev, memberData]);
        setAddModal(false);
        setNewMember({ email: "" });
        toast.success("Member added successfully!");
      } else {
        toast.error("Failed to add member - invalid response");
      }
    } catch (error) {
      console.error("[MembersList] Add member error:", error);
      toast.error(error?.response?.data?.message || "Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove ${name} from your roster?`)) return;
    try {
      await trainerService.deleteMember(id);
      setMembers((prev) => prev.filter((m) => m._id !== id));
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  return (
    <PageWrapper>
      <SectionHeader
        title="Members"
        sub={`${members.length} athletes in your roster`}
        action={
          <button
            onClick={() => setAddModal(true)}
            className="btn-primary flex items-center gap-2"
            style={{ borderRadius: 0 }}
          >
            <UserPlus size={16} /> Add Member
          </button>
        }
      />

      {/* Error Banner */}
      {error && (
        <div
          className="mb-6 p-4 rounded text-sm"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgb(239, 68, 68)",
            color: "rgb(239, 68, 68)",
          }}
        >
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--text-secondary)" }}
        />
        <input
          className="input-dark rounded pl-10"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <SkeletonList count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No Members Yet"
          sub="Add your first member to get started"
        />
      ) : (
        <div
          className="rounded overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="grid grid-cols-12 px-6 py-3 text-xs font-heading tracking-widest uppercase"
            style={{
              background: "rgba(255,255,255,0.02)",
              color: "var(--text-secondary)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span className="col-span-4">Member</span>
            <span className="col-span-3">Goal</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2">Joined</span>
            <span className="col-span-1 text-right">Actions</span>
          </div>
          {filtered.map((m, i) => (
            <motion.div
              key={m._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-12 items-center px-6 py-4 transition-colors hover:bg-white/2"
              style={{
                borderBottom:
                  i < filtered.length - 1
                    ? "1px solid rgba(255,255,255,0.04)"
                    : "none",
              }}
            >
              <div className="col-span-4 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center font-heading font-semibold text-sm"
                  style={{
                    background: "rgba(255,60,47,0.12)",
                    color: "var(--accent)",
                  }}
                >
                  {m.name?.[0] || "?"}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{m.name}</p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {m.email}
                  </p>
                </div>
              </div>
              <div className="col-span-3">
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {m.goal?.replace("_", " ") || "—"}
                </p>
              </div>
              <div className="col-span-2">
                <Badge variant={m.status === "active" ? "success" : "warn"}>
                  {m.status || "active"}
                </Badge>
              </div>
              <div className="col-span-2">
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "—"}
                </p>
              </div>
              <div className="col-span-1 flex items-center justify-end gap-2">
                <Link
                  to={`/trainer/members/${m._id}`}
                  className="p-1.5 rounded transition-colors hover:bg-white/5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Eye size={14} />
                </Link>
                <button
                  onClick={() => handleDelete(m._id, m.name)}
                  className="p-1.5 rounded transition-colors hover:bg-red/10 hover:text-red-400"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      <Modal
        open={addModal}
        onClose={() => setAddModal(false)}
        title="Assign Member to Your Roster"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div
            className="p-3 rounded text-sm"
            style={{
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgb(59, 130, 246)",
              color: "rgb(59, 130, 246)",
            }}
          >
            Enter the email of an existing member to add them to your roster
          </div>
          <Input
            label="Member Email"
            type="email"
            value={newMember.email}
            onChange={(e) =>
              setNewMember((p) => ({ ...p, email: e.target.value }))
            }
            placeholder="member@email.com"
            required
          />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setAddModal(false);
                setNewMember({ email: "" });
              }}
              className="btn-ghost flex-1"
              style={{ borderRadius: 0 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={adding}
              className="btn-primary flex-1"
              style={{ borderRadius: 0, opacity: adding ? 0.7 : 1 }}
            >
              {adding ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
