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

// const mockMembers = [
//   {
//     _id: "1",
//     name: "Alex Johnson",
//     email: "alex@gym.com",
//     goal: "Weight Loss",
//     status: "active",
//     joinedAt: "2025-01-10",
//   },
//   {
//     _id: "2",
//     name: "Sarah Chen",
//     email: "sarah@gym.com",
//     goal: "Muscle Gain",
//     status: "active",
//     joinedAt: "2025-02-15",
//   },
//   {
//     _id: "3",
//     name: "Marcus Davis",
//     email: "marcus@gym.com",
//     goal: "Endurance",
//     status: "active",
//     joinedAt: "2025-03-02",
//   },
//   {
//     _id: "4",
//     name: "Emma Wilson",
//     email: "emma@gym.com",
//     goal: "Toning",
//     status: "pending",
//     joinedAt: "2025-04-01",
//   },
// ];

export default function MembersList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    password: "",
    goal: "weight_loss",
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    trainerService
      .getMembers()
      .then(({ data }) => {
        // Backend returns: { success, message, data: [...members...], pagination }
        const membersList = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
        setMembers(membersList);
      })
      .catch((err) => {
        console.error("Failed to fetch members:", err);
        setMembers(mockMembers);
      })
      .finally(() => setLoading(false));
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
      const { data } = await trainerService.addMember(newMember);
      setMembers((prev) => [...prev, data.member || data]);
      setAddModal(false);
      toast.success("Member added successfully!");
    } catch {
      toast.error("Failed to add member");
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
        title="Add New Member"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            label="Full Name"
            value={newMember.name}
            onChange={(e) =>
              setNewMember((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="John Doe"
            required
          />
          <Input
            label="Email"
            type="email"
            value={newMember.email}
            onChange={(e) =>
              setNewMember((p) => ({ ...p, email: e.target.value }))
            }
            placeholder="john@email.com"
            required
          />
          <Input
            label="Temp Password"
            type="password"
            value={newMember.password}
            onChange={(e) =>
              setNewMember((p) => ({ ...p, password: e.target.value }))
            }
            placeholder="••••••••"
            required
          />
          <Select
            label="Fitness Goal"
            value={newMember.goal}
            onChange={(e) =>
              setNewMember((p) => ({ ...p, goal: e.target.value }))
            }
          >
            <option value="weight_loss">Weight Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="endurance">Endurance</option>
            <option value="toning">Toning</option>
          </Select>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAddModal(false)}
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
