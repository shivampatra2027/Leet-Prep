import { useState } from "react";
import { Button } from "./ui/button";
import { paymentAPI } from "../lib/api";
import { useAuthStore } from "@/store/useAuthStore";

function PaymentButton({
  amount,
  currency = "INR",
  duration,
  durationType = "months",
  planName,
  buttonText = "Get Premium Access",
}) {
  const [loading, setLoading] = useState(false);
  const userProfile = useAuthStore((s) => s.user);

  const handlePayment = async () => {
    try {
      setLoading(true);

      const response = await paymentAPI.createOrder({
        amount,
        currency: String(currency).toUpperCase(),
        notes: {
          duration,
          durationType,
          planName,
        },
      });

      const data = response.data;

      if (!data.success) {
        throw new Error("Failed to create order");
      }

      const options = {
        key: data.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Leet-Prep",
        description: `${planName} Subscription`,
        order_id: data.order.id,
        prefill: {
          name: userProfile?.username || data.user?.name || "",
          email: userProfile?.email || data.user?.email || "",
          contact: "",
        },
        notes: {
          plan: planName,
          duration: `${duration} ${durationType}`,
        },
        theme: {
          color: "#6366f1",
        },
        handler: async function (response) {
          try {
            console.log("Payment successful, verifying...", response);

            await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            window.location.href = `/payment-processing?order=${response.razorpay_order_id}`;
          } catch (error) {
            console.error("Verification error:", error);
            alert(
              "Payment verification failed. Please contact support with your payment ID: " +
                response.razorpay_payment_id,
            );
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            console.log("Payment cancelled by user");
            setLoading(false);
          },
          confirm_close: true,
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
      };

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please refresh the page.");
      }

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        alert(
          `Payment failed: ${response.error.description}\n\nReason: ${response.error.reason}\n\nPlease try again or use a different payment method.`,
        );
        setLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "Failed to initiate payment. Please try again.";
      let errorDetails = "";

      if (error.response?.status === 500) {
        const data = error.response.data;
        errorMessage = data?.message || "Server error while creating payment";
        if (data?.hint) {
          errorDetails = `\n\n${data.hint}`;
        }
        if (data?.errorType) {
          errorDetails += `\n\nError type: ${data.errorType}`;
        }

        if (
          errorMessage.includes("not configured") ||
          errorMessage.includes("invalid")
        ) {
          errorDetails +=
            "\n\nThis is a configuration issue on the server. Contact admin or check Vercel environment variables.";
        }
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "Invalid payment details.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage + errorDetails);
      setLoading(false);

      if (error.response?.status === 401) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className="w-full"
      size="lg"
    >
      {loading ? "Processing..." : buttonText}
    </Button>
  );
}

export default PaymentButton;
