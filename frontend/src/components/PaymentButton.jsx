import axios from "axios";
import { useNavigate } from "react-router-dom";

function PaymentButton({ userId }) {
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const handlePayment = async () => {
        try {
            // Call backend to create Razorpay order
            const { data: order } = await axios.post(`${API_BASE_URL}/api/payment/create-order`);

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY_ID",
                amount: order.amount,
                currency: order.currency,
                name: "Leet.IO Premium",
                description: "Upgrade to premium",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // Verify payment with backend
                        await axios.post(`${API_BASE_URL}/api/payment/verify`, {
                            ...response,
                            userId,
                        });
                        alert("Payment successful! Premium unlocked.");
                        // Redirect to dashboard after successful payment
                        navigate("/dashboard");
                    } catch (error) {
                        console.error("Payment verification failed:", error);
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    email: "user@example.com",
                },
                theme: { color: "#6366f1" },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error("Error initiating payment:", error);
            alert("Failed to initiate payment. Please try again.");
        }
    };

    return <button onClick={handlePayment}>Upgrade to Premium</button>;
}

export default PaymentButton;
