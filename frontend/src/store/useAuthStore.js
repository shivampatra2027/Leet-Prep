import { create } from "zustand";
import {
  authAPI,
  clearAccessToken,
  profileAPI,
  refreshAccessToken,
} from "@/lib/api";

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  initializing: false,

  init: async () => {
    if (get().initialized || get().initializing) return;
    set({ initializing: true, loading: true });

    try {
      await refreshAccessToken();
      const res = await profileAPI.getProfile();
      set({
        user: res.data || null,
        loading: false,
        initialized: true,
        initializing: false,
      });
    } catch {
      clearAccessToken();
      set({
        user: null,
        loading: false,
        initialized: true,
        initializing: false,
      });
    }
  },

  refreshUser: async () => {
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
      try {
        await refreshAccessToken();
        const res = await profileAPI.getProfile();
        const user = res.data || null;
        set({
          user,
          loading: false,
          initialized: true,
        });
        return user;
      } catch {
        clearAccessToken();
        set({
          user: null,
          loading: false,
          initialized: true,
        });
        return null;
      }
    }
  },

  setUser: (user) => set({ user, loading: false, initialized: true }),

  logout: () => {
    authAPI.logout().catch(() => {});
    clearAccessToken();
    set({
      user: null,
      loading: false,
      initialized: true,
    });
  },
}));
