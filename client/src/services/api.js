import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("trackfit-auth");
    console.log("🔐 Request interceptor - localStorage data:", stored);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Zustand stores as { user, token, isAuthenticated }, not wrapped in 'state'
        const token = parsed.token || parsed.state?.token;
        console.log("🔐 Token found:", !!token);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("✅ Authorization header set");
        } else {
          console.log("⚠️ No token found in localStorage");
        }
      } catch (e) {
        console.error("❌ Error parsing stored auth:", e);
      }
    } else {
      console.log("⚠️ No auth data in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    console.log("📡 API Response Error:", { status, url: error.config?.url });

    if (status === 401) {
      console.log(
        "🔴 401 Unauthorized - clearing auth and redirecting to login",
      );
      localStorage.removeItem("trackfit-auth");
      // Only redirect if not already on login page to prevent loops
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      toast.error("Session expired. Please login again.");
    } else if (status === 403) {
      console.log("🚫 403 Forbidden");
      toast.error("Access denied.");
    } else if (status === 500) {
      console.log("💥 500 Server Error");
      toast.error("Server error. Try again later.");
    }
    return Promise.reject(error);
  },
);

export default api;
