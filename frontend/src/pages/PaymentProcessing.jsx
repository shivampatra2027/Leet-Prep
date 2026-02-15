import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { paymentAPI } from "../lib/api";
import { CheckCircle2, XCircle, Loader2, AlertCircle, GalleryVerticalEnd } from "lucide-react";
import Navbar from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentProcessing() {
  const [status, setStatus] = useState("checking");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order");

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
  }, [orderId, navigate, status]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
        <Card className="w-full max-w-md border-white/20 bg-white/10 backdrop-blur-md">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              {status === "checking" && (
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
              )}
              {status === "slow" && (
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
                </div>
              )}
              {status === "success" && (
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
              )}
              {status === "failed" && (
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
              )}
              {status === "timeout" && (
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-yellow-500" />
                </div>
              )}
            </div>

            <div>
              {status === "checking" && (
                <>
                  <CardTitle className="text-2xl font-bold text-foreground mb-2">
                    Processing Payment
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Activating your premium subscription
                  </CardDescription>
                </>
              )}
              {status === "slow" && (
                <>
                  <CardTitle className="text-2xl font-bold text-foreground mb-2">
                    Almost There...
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Your payment is taking a bit longer than usual
                  </CardDescription>
                </>
              )}
              {status === "success" && (
                <>
                  <CardTitle className="text-2xl font-bold text-green-500 mb-2">
                    🎉 Premium Activated!
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Redirecting to your dashboard...
                  </CardDescription>
                </>
              )}
              {status === "failed" && (
                <>
                  <CardTitle className="text-2xl font-bold text-red-500 mb-2">
                    Payment Failed
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Your payment could not be processed
                  </CardDescription>
                </>
              )}
              {status === "timeout" && (
                <>
                  <CardTitle className="text-2xl font-bold text-yellow-500 mb-2">
                    Taking Longer Than Expected
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Your payment is being processed
                  </CardDescription>
                </>
              )}
            </div>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            {status === "checking" && (
              <p className="text-sm text-muted-foreground">
                Please don't close this window
              </p>
            )}
            
            {status === "slow" && (
              <p className="text-sm text-muted-foreground">
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
                <p className="text-sm text-muted-foreground mb-4">
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
