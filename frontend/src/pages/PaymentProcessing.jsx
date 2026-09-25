import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { paymentAPI } from "../lib/api";
import { CheckCircle2, XCircle, Loader2, AlertCircle, GalleryVerticalEnd } from "lucide-react";
import Navbar from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePremiumStore } from "@/store/usePremiumStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function PaymentProcessing() {
  const [status, setStatus] = useState("checking");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order");
  const activatePremium = usePremiumStore((s) => s.activatePremium);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  useEffect(() => {
    if (!orderId) {
      navigate("/premium");
      return;
    }

    let pollCount = 0;
    const maxPolls = 60; // 60 polls * 2 seconds = 2 minutes timeout

    const interval = setInterval(async () => {
      try {
        pollCount++;

        const res = await paymentAPI.getPaymentStatus(orderId);
        const paymentStatus = res.data.payment.status;
        const userTier = res.data.user?.tier;

        // Check if webhook has upgraded user
        if (userTier === "premium" || paymentStatus === "captured") {
          clearInterval(interval);
          activatePremium(res.data.user?.premiumExpiresAt || null);
          refreshUser().catch(() => {});
          setStatus("success");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1500);
          return;
        }

        if (paymentStatus === "failed") {
          clearInterval(interval);
          setStatus("failed");
          return;
        }

        // Show slow message after 15 seconds
        if (pollCount >= 7 && status === "checking") {
          setStatus("slow");
        }

        // Timeout after max polls
        if (pollCount >= maxPolls) {
          clearInterval(interval);
          setStatus("timeout");
        }
      } catch (err) {
        console.log("Polling error:", err);
        // Continue polling even on errors
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [activatePremium, navigate, orderId, refreshUser, status]);

  return (
    <>
      {/* <Navbar /> */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-md mx-4 border-white/20 bg-white/10 backdrop-blur-md">
          <CardHeader className="text-center space-y-3 sm:space-y-4 pb-6 sm:pb-8">
            <div className="flex justify-center">
              {status === "checking" && (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-spin" />
                </div>
              )}
              {status === "slow" && (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500 animate-spin" />
                </div>
              )}
              {status === "success" && (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
                </div>
              )}
              {status === "failed" && (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
                </div>
              )}
              {status === "timeout" && (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500" />
                </div>
              )}
            </div>

            <div>
              {status === "checking" && (
                <>
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
                    Processing Payment
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-muted-foreground">
                    Activating your premium subscription
                  </CardDescription>
                </>
              )}
              {status === "slow" && (
                <>
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
                    Almost There...
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-muted-foreground">
                    Your payment is taking a bit longer than usual
                  </CardDescription>
                </>
              )}
              {status === "success" && (
                <>
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-500 mb-2">
                    Premium Activated!
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-muted-foreground">
                    Redirecting to your dashboard...
                  </CardDescription>
                </>
              )}
              {status === "failed" && (
                <>
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-500 mb-2">
                    Payment Failed
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-muted-foreground">
                    Your payment could not be processed
                  </CardDescription>
                </>
              )}
              {status === "timeout" && (
                <>
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-500 mb-2">
                    Taking Longer Than Expected
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-muted-foreground">
                    Your payment is being processed
                  </CardDescription>
                </>
              )}
            </div>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            {status === "checking" && (
              <p className="text-xs sm:text-sm text-muted-foreground px-2">
                Please don't close this window
              </p>
            )}
            
            {status === "slow" && (
              <p className="text-xs sm:text-sm text-muted-foreground px-2">
                Don't worry — we'll activate your premium automatically
              </p>
            )}

            {status === "failed" && (
              <Button 
                onClick={() => navigate("/premium")}
                className="w-full"
              >
                Try Again
              </Button>
            )}

            {status === "timeout" && (
              <>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 px-2">
                  Premium will be activated automatically. Check back in a few minutes or contact support if needed.
                </p>
                <Button 
                  onClick={() => navigate("/dashboard")}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
