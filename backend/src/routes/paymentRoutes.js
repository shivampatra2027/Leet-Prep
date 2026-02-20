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
import paymentVerifyLimiter from "../middlewares/security/paymentLimiter.js";

const router = express.Router();

// One-Time Payment Routes (Protected)
router.post("/create-order", protect, createOrder);
router.post("/verify", protect, paymentVerifyLimiter(), verifyPayment);
router.get("/status/:orderId", protect, getPaymentStatus);
router.post("/refund", protect, processRefund);
router.get("/history", protect, getPaymentHistory);

// Webhook Route (Public but signature verified)
router.post("/webhook", handleWebhook);

export default router;
