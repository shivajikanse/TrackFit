import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Apple,
  TrendingUp,
  MessageSquare,
  StickyNote,
  Inbox,
  Zap,
  LogOut,
  ChevronLeft,
  Menu,
  Send,
  User,
} from "lucide-react";
import { useAuthStore, useAppStore } from "../../store";
import toast from "react-hot-toast";

const trainerNav = [
  { to: "/trainer", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/trainer/profile", label: "Profile", icon: User },
  { to: "/trainer/members", label: "Members", icon: Users },
  { to: "/trainer/plans", label: "Assign Plans", icon: Dumbbell },
  { to: "/trainer/broadcast", label: "Broadcast", icon: Send },
];

const memberNav = [
  { to: "/member", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/member/profile", label: "Profile", icon: User },
  { to: "/member/workout", label: "My Workout", icon: Dumbbell },
  { to: "/member/diet", label: "My Diet", icon: Apple },
  { to: "/member/progress", label: "Progress", icon: TrendingUp },

  { to: "/member/notes", label: "My Notes", icon: StickyNote },
  { to: "/member/inbox", label: "Inbox", icon: Inbox },
];

export default function Sidebar({ role }) {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const navItems = role === "trainer" ? trainerNav : memberNav;

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-full z-50 flex flex-col"
      style={{
        background: "#111111",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-4 h-16 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={toggleSidebar}
          className="p-2 rounded transition-colors hover:bg-white/5"
          style={{ color: "var(--text-secondary)" }}
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
        </button>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-3 flex items-center gap-2"
            >
              <img
                src="/Fitness Icon.png"
                alt="TrackFit Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="font-display text-xl tracking-widest text-white">
                TRACKFIT
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Role badge */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-3"
          >
            <div
              className="px-3 py-2 rounded"
              style={{
                background: "rgba(255,60,47,0.08)",
                border: "1px solid rgba(255,60,47,0.15)",
              }}
            >
              <p
                className="font-heading text-xs tracking-widest uppercase"
                style={{ color: "var(--accent)" }}
              >
                {role === "trainer" ? "⚡ Trainer Mode" : "💪 Member Mode"}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {user?.name || user?.email}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200 group relative ${
                isActive
                  ? "text-white"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`
            }
            style={({ isActive }) =>
              isActive
                ? {
                    background: "rgba(255,60,47,0.12)",
                    borderLeft: "2px solid var(--accent)",
                  }
                : {}
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  style={{
                    color: isActive ? "var(--accent)" : "inherit",
                    flexShrink: 0,
                  }}
                />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="font-body text-sm font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!sidebarOpen && (
                  <div className="absolute left-full ml-3 px-2 py-1 rounded text-xs font-medium bg-black border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div
        className="p-3 border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded w-full transition-all hover:bg-red/10 text-gray-500 hover:text-red-400"
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
