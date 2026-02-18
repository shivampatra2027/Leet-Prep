import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/ui/login-form.jsx";
import CodePreview from "@/components/CodePreview.jsx"; // import here
import Seo from "@/components/Seo.jsx";
import { getTokenTier } from "@/lib/utils";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("authToken", token);
      // Clean token from URL immediately (security: never leak JWT in referrer headers)
      window.history.replaceState({}, "", "/login");
      // Decode tier from JWT — zero network calls, instant navigation
      const tier = getTokenTier();
      navigate(tier === "premium" ? "/dashboard" : "/freedashboard", { replace: true });
    }
  }, [navigate]);

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
