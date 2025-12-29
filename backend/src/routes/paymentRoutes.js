import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js"; 

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


router.post("/create-order", async (req, res) => {
    try {
        const { amount = 99900, currency = "INR" } = req.body; 
        const options = {
            amount,
            currency,
            receipt: `receipt_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error("Error creating Razorpay order:", err);
        res.status(500).json({ error: "Failed to create order" });
    }
});

router.post("/verify", async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;

        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature === razorpay_signature) {
            // mark user as premium
            await User.findByIdAndUpdate(userId, { premium: true });
            return res.json({ success: true });
        } else {
            return res.status(400).json({ success: false, message: "Signature mismatch" });
        }
    } catch (err) {
        console.error("Error verifying Razorpay payment:", err);
        res.status(500).json({ error: "Payment verification failed" });
    }
});

export default router;
