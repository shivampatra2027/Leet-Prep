import { useEffect } from "react";
import { useAuthStore } from "./useAuthStore";
import { useReferralStore } from "./useReferralStore";
import { usePremiumStore } from "./usePremiumStore";
import { useUIStore } from "./useUIStore";

export default function useAppInit() {
  const initAuth = useAuthStore((s) => s.init);
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);

  const fetchReferral = useReferralStore((s) => s.fetchReferral);
  const resetReferral = useReferralStore((s) => s.reset);

  const fetchPremium = usePremiumStore((s) => s.fetchPremium);
  const resetPremium = usePremiumStore((s) => s.reset);

  const setAppReady = useUIStore((s) => s.setAppReady);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!initialized) return;
    setAppReady(true);

    if (!user) {
      resetReferral();
      resetPremium();
      return;
    }

    fetchReferral().catch(() => {});
    fetchPremium().catch(() => {});
  }, [
    user,
    initialized,
    fetchReferral,
    fetchPremium,
    resetReferral,
    resetPremium,
    setAppReady,
  ]);
}

