import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createOrder,
  verifyPayment,
  getPaymentStatus,
  processRefund,
  getPaymentHistory,
  handleWebhook,
  createSubscription,
  cancelSubscription,
} from "../controllers/paymentController.js";

const router = express.Router();

// Payment Management Routes (Protected)
router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/status/:orderId", protect, getPaymentStatus);
router.post("/refund", protect, processRefund);
router.get("/history", protect, getPaymentHistory);

// Subscription Routes (Protected)
router.post("/create-subscription", protect, createSubscription);
router.post("/cancel-subscription", protect, cancelSubscription);

// Webhook Route (Public but signature verified)
router.post("/webhook", handleWebhook);

export default router;
