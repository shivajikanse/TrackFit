import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("trackfit-token");
        set({ user: null, token: null, isAuthenticated: false });
      },

      isTrainer: () => get().user?.role === "trainer",
      isMember: () => get().user?.role === "member",
    }),
    {
      name: "trackfit-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrate: (state, rehydratedState) => {
        // If no user or token exists, reset isAuthenticated to false
        if (!rehydratedState.user || !rehydratedState.token) {
          rehydratedState.isAuthenticated = false;
        }
      },
    },
  ),
);

// App-wide state
export const useAppStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar: (val) => set({ sidebarOpen: val }),
}));
