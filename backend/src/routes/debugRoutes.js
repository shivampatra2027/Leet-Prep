import express from "express";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";

const router = express.Router();

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys missing in environment");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

router.get("/debug-auth", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.json({ step: "NO_TOKEN" });
    }

    let decoded = null;
    let verifyError = null;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      verifyError = e.message;
    }

    res.json({
      step: "DEBUG_INFO",
      hasToken: !!token,
      jwtSecretExists: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET?.length,
      decoded,
      verifyError,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        RAZORPAY_KEY_ID: !!process.env.RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET: !!process.env.RAZORPAY_KEY_SECRET,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/rzp-test", async (req, res) => {
  try {
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: 100,
      currency: "INR",
      receipt: "test",
    });
    res.json(order);
  } catch (e) {
    res.json({ error: e.message, description: e?.error?.description });
  }
});

export default router;
