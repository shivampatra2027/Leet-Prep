import { create } from "zustand";

export const useUIStore = create((set) => ({
  appReady: false,
  setAppReady: (ready) => set({ appReady: ready }),
}));

