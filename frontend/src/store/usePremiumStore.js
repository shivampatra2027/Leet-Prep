import { create } from "zustand";
import { premiumAPI } from "@/lib/api";

export const usePremiumStore = create((set) => ({
  premium: false,
  expiresAt: null,
  loading: false,
  redirectPath: "/freedashboard",

  fetchPremium: async () => {
    set({ loading: true });
    try {
      const res = await premiumAPI.checkDashboard();
      const redirectPath = res.data?.redirectPath || "/freedashboard";
      set({
        premium: redirectPath === "/dashboard",
        expiresAt: null,
        redirectPath,
        loading: false,
      });
      return res.data;
    } catch {
      set({
        premium: false,
        expiresAt: null,
        redirectPath: "/freedashboard",
        loading: false,
      });
      return null;
    }
  },

  activatePremium: (expiresAt = null) =>
    set({ premium: true, expiresAt, redirectPath: "/dashboard" }),

  reset: () =>
    set({
      premium: false,
      expiresAt: null,
      loading: false,
      redirectPath: "/freedashboard",
    }),
}));

