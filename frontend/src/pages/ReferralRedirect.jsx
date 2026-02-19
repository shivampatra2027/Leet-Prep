import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
    if (code) {
      localStorage.setItem("pendingReferral", code.trim());
    }
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/freedashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [code, navigate]);

  return null; // renders nothing — instant redirect
}
