import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { premiumAPI } from "@/lib/api";

export default function PremiumRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await premiumAPI.checkDashboard();
        if (response.data.success && response.data.tier === 'premium') {
          setIsPremium(true);
        }
      } catch (error) {
        console.error("Error checking premium status:", error);
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    };

    checkPremiumStatus();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (!isPremium) {
    return <Navigate to="/premium" />;
  }

  return children;
}
