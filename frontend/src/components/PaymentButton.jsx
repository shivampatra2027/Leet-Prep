import { useState } from "react";
import { Button } from "./ui/button";
import { paymentAPI } from "../lib/api";
import { useAuthStore } from "@/store/useAuthStore";

function PaymentButton({ amount, currency = "INR", duration, durationType = "months", planName }) {
    const [loading, setLoading] = useState(false);
    const userProfile = useAuthStore((s) => s.user);

    const handlePayment = async () => {
        try {
            setLoading(true);

            // Step 1: Create Razorpay order (as per official docs Section 1.1)
            const response = await paymentAPI.createOrder({ 
                amount: amount, // Amount in paise
                currency,
                notes: {
                    duration: duration, // 1 or 2 (months/days)
                    durationType: durationType, // "months" or "days"
                    planName: planName
                }
            });

            const data = response.data;

            if (!data.success) {
                throw new Error('Failed to create order');
            }

            // Step 2: Configure Razorpay Checkout (as per official docs Section 1.2)
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Your API Key ID
                amount: data.order.amount, // Amount from order
                currency: data.order.currency,
                name: "Leet-Prep", // Your business name
                description: `${planName} Subscription`,
                order_id: data.order.id, // Order ID from Step 1
                
                // Prefill customer information (increases conversion rate)
                prefill: {
                    name: userProfile?.username || data.user?.name || "",
                    email: userProfile?.email || data.user?.email || "",
                    contact: "" // Add phone number if you collect it
                },
                
                // Notes for your reference
                notes: {
                    plan: planName,
                    duration: `${duration} ${durationType}`,
                },
                
                // Theme customization
                theme: { 
                    color: "#6366f1" // Your brand color
                },
                
                // Payment success handler (Section 1.3)
                handler: async function (response) {
                    try {
                        console.log('Payment successful, verifying...', response);
                        
                        // Step 3: Verify payment signature on server (non-blocking UI check)
                        await paymentAPI.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        // Navigate to processing page - webhook will activate premium
                        window.location.href = `/payment-processing?order=${response.razorpay_order_id}`;
                    } catch (error) {
                        console.error('Verification error:', error);
                        alert("Payment verification failed. Please contact support with your payment ID: " + response.razorpay_payment_id);
                        setLoading(false);
                    }
                },
                
                // Modal configuration
                modal: {
                    ondismiss: function() {
                        console.log('Payment cancelled by user');
                        setLoading(false);
                    },
                    // Prevent accidental dismissal
                    confirm_close: true,
                },
                
                // Retry configuration (allows up to 3 automatic retries)
                retry: {
                    enabled: true,
                    max_count: 3
                },
            };

            // Step 3: Initialize Razorpay Checkout
            if (!window.Razorpay) {
                throw new Error('Razorpay SDK not loaded. Please refresh the page.');
            }

            const rzp = new window.Razorpay(options);
            
            // Payment failure handler (Section 1.3)
            rzp.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                alert(`Payment failed: ${response.error.description}\n\nReason: ${response.error.reason}\n\nPlease try again or use a different payment method.`);
                setLoading(false);
            });

            // Open Razorpay Checkout
            rzp.open();
            
        } catch (error) {
            console.error('Payment error:', error);
            console.error('Error response:', error.response?.data);
            
            // Better error messages with backend details
            let errorMessage = "Failed to initiate payment. Please try again.";
            let errorDetails = "";
            
            if (error.response?.status === 500) {
                // Backend server error - show detailed message
                const data = error.response.data;
                errorMessage = data?.message || "Server error while creating payment";
                if (data?.hint) {
                    errorDetails = `\n\n${data.hint}`;
                }
                if (data?.errorType) {
                    errorDetails += `\n\nError type: ${data.errorType}`;
                }
                
                // Show specific guidance for common issues
                if (errorMessage.includes("not configured") || errorMessage.includes("invalid")) {
                    errorDetails += "\n\nThis is a configuration issue on the server. Contact admin or check Vercel environment variables.";
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
            
            // Redirect to login if unauthorized
            if (error.response?.status === 401) {
                setTimeout(() => {
                    window.location.href = '/login';
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
            {loading ? "Processing..." : "Get Premium Access"}
        </Button>
    );
}

export default PaymentButton;
