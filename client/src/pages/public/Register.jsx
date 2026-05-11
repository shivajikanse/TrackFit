import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "../../services";
import { useAuthStore } from "../../store";
import { Input } from "../../components/ui";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
    trainerId: "",
  });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  // DEBUG: Log when Register component mounts
  console.log("📝 Register Component Mounted");
  console.log("🔍 Current Auth State:", useAuthStore.getState());

  useEffect(() => {
    console.log("✅ Register component actually rendered to DOM");
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();

    // Validate trainer ID for members
    if (form.role === "member" && !form.trainerId.trim()) {
      toast.error("Trainer ID is required for members");
      return;
    }

    setLoading(true);
    try {
      console.log("📤 Sending register request:", form);
      const response = await authService.register(form);
      console.log("📥 Full Axios Response:", response);

      // Extract from nested data structure
      const { data: apiData } = response;
      const user = apiData.data?.user;
      // Server returns accessToken, not token
      const token = apiData.data?.accessToken;

      console.log("📥 Extracted user:", user);
      console.log("📥 Extracted token:", token);

      if (!user || !token) {
        console.error("❌ Response missing user or token!", { user, token });
        toast.error("Registration failed: Invalid server response");
        setLoading(false);
        return;
      }

      setAuth(user, token);
      console.log("✅ setAuth called, auth store updated");
      console.log("✅ Current store state:", useAuthStore.getState());
      toast.success("Welcome to TrackFit!");
      navigate(user.role === "trainer" ? "/trainer" : "/member");
    } catch (err) {
      console.error("❌ Register error:", err);
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: "#0A0A0A" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center gap-2 mb-10">
          <div
            className="w-7 h-7 flex items-center justify-center"
            style={{ background: "var(--accent)" }}
          >
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span className="font-display text-xl tracking-widest text-white">
            TRACKFIT
          </span>
        </Link>

        <h1 className="font-heading font-semibold text-3xl uppercase tracking-wide text-white mb-2">
          Create Account
        </h1>
        <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
          Join the elite fitness platform
        </p>

        {/* Role select */}
        <div className="flex gap-3 mb-8">
          {["member", "trainer"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: r }))}
              className="flex-1 py-3 rounded font-heading font-semibold text-sm uppercase tracking-wider transition-all"
              style={
                form.role === r
                  ? { background: "var(--accent)", color: "white" }
                  : {
                      background: "var(--bg-muted)",
                      color: "var(--text-secondary)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }
              }
            >
              {r === "member" ? "💪 Member" : "⚡ Trainer"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-5">
          <Input
            label="Full Name"
            value={form.name}
            onChange={set("name")}
            placeholder="John Doe"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="john@gym.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={set("password")}
            placeholder="Min. 8 characters"
            minLength={8}
            required
          />

          {form.role === "member" && (
            <Input
              label="Trainer ID"
              type="text"
              value={form.trainerId}
              onChange={set("trainerId")}
              placeholder="Ask your trainer for their ID (e.g., TR-ABC123)"
              required
              style={{
                borderColor: "rgba(255,60,47,0.3)",
                background: "rgba(255,60,47,0.05)",
              }}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-base mt-2"
            style={{ borderRadius: 0, opacity: loading ? 0.7 : 1 }}
          >
            {loading
              ? "Creating Account..."
              : `Join as ${form.role === "trainer" ? "Trainer" : "Member"} →`}
          </button>
        </form>

        <p
          className="text-center mt-6 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "var(--accent)" }}
            className="font-medium hover:underline"
          >
            Sign in →
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
