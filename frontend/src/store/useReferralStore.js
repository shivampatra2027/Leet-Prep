import { create } from "zustand";
import { referralAPI } from "@/lib/api";

export const useReferralStore = create((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchReferral: async () => {
    set({ loading: true, error: null });
    try {
      const res = await referralAPI.getMe();
      set({ data: res.data, loading: false, error: null });
      return res.data;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.error || "Failed to load referral data",
      });
      throw err;
    }
  },

  applyReferral: async (code) => {
    const res = await referralAPI.apply(code);
    return res.data;
  },

  joinReferral: async () => {
    const res = await referralAPI.join();
    return res.data;
  },

  reset: () => set({ data: null, loading: false, error: null }),
}));

