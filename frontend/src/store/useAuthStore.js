import { create } from "zustand";
import { profileAPI } from "@/lib/api";

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  initializing: false,

  init: async () => {
    if (get().initialized || get().initializing) return;
    set({ initializing: true });

    const token = localStorage.getItem("authToken");
    if (!token) {
      set({ user: null, loading: false, initialized: true, initializing: false });
      return;
    }

    try {
      const res = await profileAPI.getProfile();
      set({
        user: res.data || null,
        loading: false,
        initialized: true,
        initializing: false,
      });
    } catch {
      localStorage.removeItem("authToken");
      set({
        user: null,
        loading: false,
        initialized: true,
        initializing: false,
      });
    }
  },

  refreshUser: async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      set({ user: null, loading: false, initialized: true });
      return null;
    }

    set({ loading: true });
    try {
      const res = await profileAPI.getProfile();
      const user = res.data || null;
      set({
        user,
        loading: false,
        initialized: true,
      });
      return user;
    } catch {
      localStorage.removeItem("authToken");
      set({
        user: null,
        loading: false,
        initialized: true,
      });
      return null;
    }
  },

  setUser: (user) => set({ user, loading: false, initialized: true }),

  logout: () => {
    localStorage.removeItem("authToken");
    set({
      user: null,
      loading: false,
      initialized: true,
    });
  },
}));
