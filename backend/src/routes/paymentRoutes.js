import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createOrder,
  verifyPayment,
  getPaymentStatus,
  processRefund,
  getPaymentHistory,
  handleWebhook,
} from "../controllers/paymentController.js";
import { pollingLimiter, strictLimiter } from "../middlewares/rateLimiters.js";

const router = express.Router();

// One-Time Payment Routes (Protected)
router.post("/create-order", protect, createOrder);
router.post("/verify", protect, strictLimiter, verifyPayment);
router.get("/status/:orderId", protect, pollingLimiter, getPaymentStatus);
router.post("/refund", protect, processRefund);
router.get("/history", protect, getPaymentHistory);

// Webhook Route (Public but signature verified)
router.post("/webhook", handleWebhook);

export default router;
