import axios from "axios";

function PaymentButton({ userId }) {
    const handlePayment = async () => {
        // Call backend to create Razorpay order
        const { data: order } = await axios.post("http://localhost:8080/api/payment/create-order");

        const options = {
            key: "YOUR_RAZORPAY_KEY_ID", // from .env
            amount: order.amount,
            currency: order.currency,
            name: "Leet.IO Premium",
            description: "Upgrade to premium",
            order_id: order.id,
            handler: async function (response) {
                // Verify payment with backend
                await axios.post("http://localhost:8080/api/payment/verify", {
                    ...response,
                    userId,
                });
                alert("Payment successful! Premium unlocked.");
            },
            prefill: {
                email: "user@example.com",
            },
            theme: { color: "#6366f1" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    return <button onClick={handlePayment}>Upgrade to Premium</button>;
}

export default PaymentButton;
