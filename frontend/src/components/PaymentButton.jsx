import axios from "axios";
import { useState } from "react";

function PaymentButton({ userId, user }) {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        try {
            setLoading(true);

            // Call backend to create Razorpay order
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/payment/create-order`,
                { 
                    amount: 99900, // ₹999
                    currency: "INR" 
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
                description: "Upgrade to premium access",
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
                            alert("Payment successful! Premium unlocked.");
                            window.location.reload(); // Refresh to update user status
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
                prefill: {
                    email: user?.email || "",
                    name: user?.name || ""
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
        <button 
            onClick={handlePayment}
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? "Processing..." : "Upgrade to Premium"}
        </button>
    );
}

export default PaymentButton;
