import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authAPI, getAccessToken } from "@/lib/api";

/**
 * Handles /r/:code links.
 * Stores the referral code in localStorage then forwards to /login.
 * If user is already logged in they go straight to /freedashboard
 * (referral won't apply since they're already registered, but it's graceful).
 */
export default function ReferralRedirect() {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      if (code) {
        localStorage.setItem("pendingReferral", code.trim());
      }

      if (getAccessToken()) {
        navigate("/freedashboard", { replace: true });
        return;
      }

      try {
        await authAPI.refresh();
        navigate("/freedashboard", { replace: true });
      } catch {
        navigate("/login", { replace: true });
      }
    };

    run();
  }, [code, navigate]);

  return null; // renders nothing — instant redirect
}
