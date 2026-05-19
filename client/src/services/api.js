import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("trackfit-auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Zustand stores as { user, token, isAuthenticated }, not wrapped in 'state'
        const token = parsed.token || parsed.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        // Silent fail
      }
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

    if (status === 401) {
      localStorage.removeItem("trackfit-auth");
      // Only redirect if not already on login page to prevent loops
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      toast.error("Session expired. Please login again.");
    } else if (status === 403) {
      toast.error("Access denied.");
    } else if (status === 500) {
      toast.error("Server error. Try again later.");
    }
    return Promise.reject(error);
  },
);

export default api;
