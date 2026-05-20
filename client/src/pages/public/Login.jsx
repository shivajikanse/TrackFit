import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "../../services";
import { useAuthStore } from "../../store";
import { Input } from "../../components/ui";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {}, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login(form);
      const { data: apiData } = response;
      const user = apiData.data?.user;
      const token = apiData.data?.accessToken;

      if (!user || !token) {
        toast.error("Login failed: Invalid server response");
        setLoading(false);
        return;
      }

      setAuth(user, token);
      toast.success(`Welcome back, ${user.name || user.email}!`);
      navigate(user.role === "trainer" ? "/trainer" : "/member");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0A0A0A" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "#111" }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,60,47,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,60,47,0.04) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,60,47,0.1) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <Link to="/" className="relative flex items-center gap-2">
          <img
            src="/Fitness Icon.png"
            alt="TrackFit Logo"
            className="w-10 h-10 object-contain"
          />

          <span className="font-display text-2xl tracking-widest text-white">
            TRACKFIT
          </span>
        </Link>

        <div className="relative">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-white mb-6"
            style={{
              fontSize: "72px",
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
            }}
          >
            YOUR
            <br />
            <span style={{ color: "var(--accent)" }}>FITNESS</span>
            <br />
            JOURNEY
            <br />
            AWAITS.
          </motion.h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "320px" }}>
            Connect with your trainer, follow your personalized plan, and track
            every step of progress.
          </p>
        </div>

        <div className="relative flex gap-8">
          {[
            ["2.4K+", "Athletes"],
            ["98%", "Retention"],
            ["AI", "Powered"],
          ].map(([val, label]) => (
            <div key={label}>
              <p
                className="font-display text-2xl"
                style={{ color: "var(--accent)" }}
              >
                {val}
              </p>
              <p
                className="text-xs font-heading tracking-widest uppercase"
                style={{ color: "var(--text-secondary)" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h1 className="font-heading font-semibold text-3xl uppercase tracking-wide text-white mb-2">
              Sign In
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Access your TrackFit dashboard
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="trainer@gym.com"
              required
            />

            <div className="space-y-1.5">
              <label
                className="block text-xs font-heading tracking-widest uppercase"
                style={{ color: "var(--text-secondary)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="input-dark rounded pr-10"
                  value={form.password}
                  onChange={set("password")}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base mt-2"
              style={{ borderRadius: 0, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Signing In..." : "Sign In →"}
            </button>
          </form>

          {/* Demo accounts */}
          <div
            className="mt-6 p-4 rounded"
            style={{
              background: "var(--bg-muted)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p
              className="text-xs font-heading tracking-widest uppercase mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Demo Accounts
            </p>
            <div className="space-y-2">
              {[
                {
                  label: "Trainer",
                  email: "trainer@demo.com",
                  pass: "password123",
                },
                {
                  label: "Member",
                  email: "member@demo.com",
                  pass: "password123",
                },
              ].map(({ label, email, pass }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setForm({ email, password: pass })}
                  className="w-full text-left px-3 py-2 rounded text-xs transition-colors hover:bg-white/5"
                  style={{
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span style={{ color: "var(--accent)" }}>{label}</span>:{" "}
                  {email}
                </button>
              ))}
            </div>
          </div>

          <p
            className="text-center mt-6 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            New to TrackFit?{" "}
            <Link
              to="/register"
              style={{ color: "var(--accent)" }}
              className="font-medium hover:underline"
            >
              Create account →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
