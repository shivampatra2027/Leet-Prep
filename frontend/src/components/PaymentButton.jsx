import axios from "axios";
import { useState } from "react";
import { Button } from "./ui/button";

function PaymentButton({ amount, duration, planName }) {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        try {
            setLoading(true);

            // Call backend to create Razorpay order
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/payment/create-order`,
                { 
                    amount: amount, // Amount in paise
                    currency: "INR",
                    notes: {
                        duration: duration, // 1 or 3 months
                        planName: planName
                    }
                },
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!data.success) {
                throw new Error('Failed to create order');
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data.order.amount,
                currency: data.order.currency,
                name: "Leet-Prep Premium",
                description: `${planName} - Premium Access`,
                order_id: data.order.id,
                handler: async function (response) {
                    try {
                        // Verify payment with backend
                        const verifyResponse = await axios.post(
                            `${import.meta.env.VITE_API_URL}/api/payment/verify`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            },
                            { 
                                withCredentials: true,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        if (verifyResponse.data.success) {
                            alert("Payment successful! Premium unlocked. Redirecting to dashboard...");
                            // Redirect to dashboard after successful payment
                            setTimeout(() => {
                                window.location.href = '/dashboard';
                            }, 1500);
                        }
                    } catch (error) {
                        console.error('Verification error:', error);
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                modal: {
                    ondismiss: function() {
                        setLoading(false);
                    }
                },
                theme: { 
                    color: "#6366f1" 
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                alert(`Payment failed: ${response.error.description}`);
                setLoading(false);
            });

            rzp.open();
        } catch (error) {
            console.error('Payment error:', error);
            alert("Failed to initiate payment. Please try again.");
            setLoading(false);
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
