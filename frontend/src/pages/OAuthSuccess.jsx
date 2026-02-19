import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { usePremiumStore } from "@/store/usePremiumStore";
import { useReferralStore } from "@/store/useReferralStore";
import { setAccessToken } from "@/lib/api";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const fetchPremium = usePremiumStore((s) => s.fetchPremium);
  const fetchReferral = useReferralStore((s) => s.fetchReferral);
  const applyReferral = useReferralStore((s) => s.applyReferral);

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      setAccessToken(token);
      window.history.replaceState({}, "", "/oauth-success");

      const pendingReferral = localStorage.getItem("pendingReferral");
      if (pendingReferral) {
        await applyReferral(pendingReferral).catch(() => null);
        localStorage.removeItem("pendingReferral");
      }

      const user = await refreshUser();
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      const [premiumRes] = await Promise.all([
        fetchPremium(),
        fetchReferral().catch(() => null),
      ]);
      const redirectPath =
        premiumRes?.redirectPath ||
        (user.tier === "premium" ? "/dashboard" : "/freedashboard");
      navigate(redirectPath, { replace: true });
    };

    run().catch(() => {
      navigate("/login", { replace: true });
    });
  }, [applyReferral, fetchPremium, fetchReferral, navigate, refreshUser]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary/25 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground">
          Signing you in...
        </p>
      </div>
    </div>
  );
}
