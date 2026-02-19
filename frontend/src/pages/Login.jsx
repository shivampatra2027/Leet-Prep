import { useEffect, useState } from "react";
import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/ui/login-form.jsx";
import CodePreview from "@/components/CodePreview.jsx"; // import here
import { referralAPI } from "@/lib/api.js";
import Seo from "@/components/Seo.jsx";
import { useAuthStore } from "@/store/useAuthStore";
import { usePremiumStore } from "@/store/usePremiumStore";

// After login, silently apply any referral code the user arrived with
function applyPendingReferral() {
  const code = localStorage.getItem("pendingReferral");
  if (!code) return;
  referralAPI.apply(code)
    .then(() => localStorage.removeItem("pendingReferral"))
    .catch(() => {}); // non-critical, ignore errors
}

export default function Login() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const fetchPremium = usePremiumStore((s) => s.fetchPremium);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      const bootstrapLogin = async () => {
        setIsRedirecting(true);
        localStorage.setItem("authToken", token);
        window.history.replaceState({}, "", "/login");
        applyPendingReferral();

        await refreshUser();
        const premiumRes = await fetchPremium();
        window.location.href = premiumRes?.redirectPath || "/freedashboard";
      };

      bootstrapLogin().catch(() => {
        window.location.href = "/freedashboard";
      });
    }
  }, [fetchPremium, refreshUser]);

  if (isRedirecting) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-background px-6">
        <Seo
          title="Login | Leet-Prep"
          description="Sign in to practice company-wise coding interview problems and track your analytics."
          canonical={`${import.meta.env.VITE_SITE_URL || "https://leetcodepremium.xyz"}/login`}
        />
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 rounded-full border-4 border-primary/25 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Signing you in and preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <Seo
        title="Login | Leet-Prep"
        description="Sign in to practice company-wise coding interview problems and track your analytics."
        canonical={`${import.meta.env.VITE_SITE_URL || "https://leetcodepremium.xyz"}/login`}
      />
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Leet-Prep
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Right side: code editor instead of image */}
      <div className="relative hidden lg:flex items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black ">
        <div className="w-full h-full rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6 transition">
          <CodePreview />
        </div>
      </div>
    </div>
  );
}
