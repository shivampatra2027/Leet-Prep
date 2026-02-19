import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GalleryVerticalEnd } from "lucide-react";
import { SignupForm } from "@/components/ui/signup-form.jsx";
import { setAccessToken } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePremiumStore } from "@/store/usePremiumStore";

export default function Signup() {
    const navigate = useNavigate();
    const refreshUser = useAuthStore((s) => s.refreshUser);
    const fetchPremium = usePremiumStore((s) => s.fetchPremium);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        if (token) {
            const bootstrap = async () => {
                setAccessToken(token);
                await refreshUser();
                const premiumRes = await fetchPremium();
                navigate(premiumRes?.redirectPath || "/freedashboard", {
                    replace: true,
                });
            };
            bootstrap().catch(() => {
                navigate("/freedashboard", { replace: true });
            });
        }
    }, [fetchPremium, navigate, refreshUser]);

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="/" className="flex items-center gap-2 font-medium">
                        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        Leet.IO
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <SignupForm />
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:block">
                <img
                    src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&auto=format&fit=crop&q=80"
                    alt="Coding workspace"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    );
}
