import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import { recordPurchaseEvent } from "./referralController.js";

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

const RZP_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();

function parsePlanMetadata(notes = {}) {
  const rawDuration = Number.parseInt(notes.duration, 10);
  const duration =
    Number.isFinite(rawDuration) && rawDuration > 0 ? rawDuration : 1;
  const durationType = notes.durationType === "days" ? "days" : "months";
  const planName =
    typeof notes.planName === "string" && notes.planName.trim()
      ? notes.planName.trim()
      : `${duration} ${durationType}`;

  return { duration, durationType, planName };
}

/**
 * Create a new Razorpay order
 * @route POST /api/payment/create-order
 * @access Private
 */
export const createOrder = async (req, res) => {
  try {
    // Step 1: Check authentication FIRST
    if (!req.user) {
      console.error("createOrder: req.user missing after protect");
      return res.status(401).json({ error: "User not authenticated" });
    }

    const {
      amount: rawAmount,
      currency: rawCurrency = "INR",
      notes,
    } = req.body ?? {};

    const currency =
      typeof rawCurrency === "string" ? rawCurrency.toUpperCase() : "INR";
    const supportedCurrencies = new Set(["INR", "USD"]);

    if (!supportedCurrencies.has(currency)) {
      return res.status(400).json({
        error: "Unsupported currency",
        message: "Only INR and USD are supported",
      });
    }

    // Step 2: Validate and sanitize amount
    const amount = Number.isFinite(Number(rawAmount))
      ? Math.floor(Number(rawAmount)) // Ensure integer in smallest currency unit
      : 99900;

    if (amount <= 0) {
      return res.status(400).json({
        error: "Invalid amount",
        message:
          "Amount must be a positive integer in the smallest currency unit",
      });
    }

    // Minimum amount: 100 in smallest unit (e.g., ₹1.00 or $1.00)
    if (amount < 100) {
      return res.status(400).json({
        error: "Amount too small",
        message: "Minimum amount is 100 in the smallest currency unit",
      });
    }

    // Step 3: Validate Razorpay credentials (read fresh from env)
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    console.log("Checking Razorpay configuration...");
    console.log("Key ID present:", !!keyId);
    console.log("Key Secret present:", !!keySecret);

    if (!keyId || !keySecret) {
      return res.status(500).json({
        error: "Razorpay keys not configured",
        message:
          "Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in environment",
      });
    }

    // Step 4: Create Razorpay order options
    const shortUserId = req.user._id.toString().slice(-6);
    const shortTime = Date.now().toString().slice(-6);

    const options = {
      amount,
      currency,
      receipt: `rcpt_${shortUserId}_${shortTime}`,
      notes: {
        userId: req.user._id.toString(),
        email: req.user.email,
        username: req.user.username || req.user.name || "User",
        ...notes,
      },
    };

    // Step 5: Create order on Razorpay (get fresh instance per request)
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create(options);

    console.log(`Razorpay order created: ${order.id}`);

    // Step 6: Return success response (no DB write - webhook handles it)
    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID, // REQUIRED for frontend Razorpay Checkout
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      user: {
        name: req.user.name || req.user.username,
        email: req.user.email,
      },
    });
  } catch (err) {
    console.error("Error creating Razorpay order:", err.message);

    const statusCode = err?.statusCode || 500;
    const errorDescription =
      err?.error?.description || err?.message || "Unknown error occurred";
    const errorType = err?.error?.code || err?.name || "OrderCreationError";

    let hint = undefined;
    if (
      statusCode === 401 ||
      statusCode === 403 ||
      errorDescription.includes("authentication")
    ) {
      hint = "Check Razorpay API keys and ensure correct mode (test vs live)";
    } else if (
      errorDescription.includes("network") ||
      errorDescription.includes("ENOTFOUND")
    ) {
      hint = "Check internet connection and Razorpay server status";
    } else if (errorDescription.includes("amount")) {
      hint =
        "Verify amount is a positive integer in the smallest unit (e.g., INR paise or USD cents)";
    }

    res.status(statusCode).json({
      error: "Failed to create order",
      message: errorDescription,
      errorType,
      statusCode,
      hint,
    });
  }
};

/**
 * Verify payment signature and update user to premium
 * @route POST /api/payment/verify
 * @access Private
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        error: "Razorpay secret missing",
        message:
          "RAZORPAY_KEY_SECRET is not configured on the backend. Please set it in the environment variables.",
      });
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      console.log(
        `Signature verification failed for order ${razorpay_order_id}`,
      );
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    // Signature verified! Webhook will handle DB operations and premium activation
    console.log(
      `Payment signature verified for order ${razorpay_order_id}. Webhook will handle DB and activation.`,
    );

    return res.json({
      success: true,
      message: "Payment verified. Premium will be activated via webhook...",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (err) {
    console.error("Error verifying Razorpay payment:", err);
    res.status(500).json({
      error: "Payment verification failed",
      message: err.message,
    });
  }
};

/**
 * Get payment status by order ID
 * @route GET /api/payment/status/:orderId
 * @access Private
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Find payment in database
    const payment = await Payment.findOne({
      orderId,
      user: req.user._id,
    }).select("-__v");

    // Payment might not exist yet (webhook hasn't arrived)
    if (!payment) {
      // Fetch user's current tier to check if already upgraded
      const user = await User.findById(req.user._id).select(
        "tier premiumExpiresAt",
      );

      return res.json({
        success: true,
        payment: {
          orderId: orderId,
          status: "pending", // Webhook hasn't processed yet
        },
        user: {
          tier: user.tier,
          premiumExpiresAt: user.premiumExpiresAt,
        },
      });
    }

    // Optionally fetch latest status from Razorpay if payment ID exists
    if (payment.paymentId) {
      try {
        const razorpay = getRazorpay();
        const razorpayPayment = await razorpay.payments.fetch(
          payment.paymentId,
        );

        // Update local record if status changed
        if (razorpayPayment.status !== payment.status) {
          payment.status = razorpayPayment.status;
          await payment.save();
        }
      } catch (error) {
        console.error("Error fetching from Razorpay:", error.message);
        // Continue with database record
      }
    }

    // Fetch user's current tier
    const user = await User.findById(req.user._id).select(
      "tier premiumExpiresAt",
    );

    res.json({
      success: true,
      payment: {
        orderId: payment.orderId,
        paymentId: payment.paymentId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      },
      user: {
        tier: user.tier,
        premiumExpiresAt: user.premiumExpiresAt,
      },
    });
  } catch (err) {
    console.error("Error fetching payment status:", err);
    res.status(500).json({
      error: "Failed to fetch payment status",
      message: err.message,
    });
  }
};

/**
 * Process refund for a payment
 * @route POST /api/payment/refund
 * @access Private
 */
export const processRefund = async (req, res) => {
  try {
    const { paymentId, amount, notes } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!paymentId) {
      return res.status(400).json({
        error: "Payment ID is required",
      });
    }

    // Find payment record
    const payment = await Payment.findOne({
      paymentId,
      user: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found or unauthorized",
      });
    }

    if (payment.status === "refunded") {
      return res.status(400).json({
        success: false,
        message: "Payment already refunded",
      });
    }

    // Process refund with Razorpay (get fresh instance per request)
    const razorpay = getRazorpay();
    const refundOptions = {
      payment_id: paymentId,
      ...(amount && { amount }), // Partial refund if amount specified
      ...(notes && { notes }),
    };

    const refund = await razorpay.payments.refund(paymentId, refundOptions);

    // Update payment record
    payment.status = "refunded";
    payment.refundId = refund.id;
    payment.refundAmount = refund.amount;
    payment.refundStatus = "processed";
    await payment.save();

    // If full refund, downgrade user to free
    if (!amount || amount >= payment.amount) {
      await User.findByIdAndUpdate(req.user._id, {
        tier: "free",
        subscriptionStatus: "expired",
        subscriptionEndDate: null,
        premiumExpiresAt: null,
      });
    }

    res.json({
      success: true,
      message: "Refund processed successfully",
      refund: {
        refundId: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
      },
    });
  } catch (err) {
    console.error("Error processing refund:", err);

    // Update refund status to failed
    if (req.body.paymentId) {
      await Payment.findOneAndUpdate(
        { paymentId: req.body.paymentId },
        { refundStatus: "failed" },
      );
    }

    res.status(500).json({
      error: "Failed to process refund",
      message: err.message,
    });
  }
};

/**
 * Get payment history for authenticated user
 * @route GET /api/payment/history
 * @access Private
 */
export const getPaymentHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    // Get payments with pagination
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select("-user -signature -__v");

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error fetching payment history:", err);
    res.status(500).json({
      error: "Failed to fetch payment history",
      message: err.message,
    });
  }
};

/**
 * Handle Razorpay webhooks
 * @route POST /api/payment/webhook
 * @access Public (but verified with signature)
 */
export const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = RZP_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (!webhookSecret) {
      console.error("Webhook secret not configured");
      return res.status(500).json({ error: "Webhook not configured" });
    }

    if (!signature) {
      console.error("Missing Razorpay signature header");
      return res.status(400).json({ error: "Signature header missing" });
    }

    // Razorpay signs the raw request body. If express.json() has parsed it
    // we lose the original bytes, so fallback to Buffer when available.
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(JSON.stringify(req.body || {}));

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Invalid webhook signature");
      return res.status(400).json({ error: "Invalid signature" });
    }

    let parsedBody = req.body;
    if (Buffer.isBuffer(req.body)) {
      try {
        parsedBody = JSON.parse(req.body.toString("utf8"));
      } catch (parseErr) {
        console.error("Failed to parse webhook body:", parseErr);
        return res.status(400).json({ error: "Malformed webhook payload" });
      }
    }

    const event = parsedBody?.event;
    const payload = parsedBody?.payload;

    console.log(`Webhook received: ${event}`);

    // Handle different webhook events
    switch (event) {
      case "payment.authorized":
      case "payment.captured":
        await handlePaymentSuccess(payload?.payment?.entity);
        break;

      case "payment.failed":
        await handlePaymentFailed(payload?.payment?.entity);
        break;

      case "refund.created":
      case "refund.processed":
        await handleRefundProcessed(payload?.refund?.entity);
        break;

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.json({ success: true, received: true });
  } catch (err) {
    console.error("Error handling webhook:", err);
    res
      .status(500)
      .json({ error: "Webhook processing failed", message: err.message });
  }
};

// Helper functions for webhook handlers
async function handlePaymentSuccess(paymentEntity) {
  try {
    if (!paymentEntity) {
      console.error("Webhook payment entity missing");
      return;
    }

    // 1. Prevent duplicate entries (webhooks retry many times)
    const existing = await Payment.findOne({
      paymentId: paymentEntity.id,
    });

    if (existing) {
      console.log(
        "Webhook retry ignored - payment already processed:",
        paymentEntity.id,
      );
      return;
    }

    // 2. Extract plan metadata from payment notes
    const notes = paymentEntity.notes || {};
    const { duration, durationType, planName } = parsePlanMetadata(notes);
    const userId = notes.userId;

    if (!userId) {
      console.error(
        "No userId in payment notes - cannot process:",
        paymentEntity.id,
      );
      return;
    }

    // 3. Store ONLY successful payments (first DB write happens here)
    const payment = await Payment.create({
      user: userId,
      orderId: paymentEntity.order_id,
      paymentId: paymentEntity.id,
      amount: paymentEntity.amount,
      planName,
      planDuration: duration,
      planDurationType: durationType,
      currency: paymentEntity.currency,
      status: paymentEntity.status, // captured
      paymentMethod: paymentEntity.method,
      receipt: paymentEntity.receipt || null,
      notes: JSON.stringify(notes),
      capturedAt: new Date(),
    });

    console.log(`Payment record created in DB: ${paymentEntity.id}`);

    // 4. Upgrade user to premium with flexible duration (days or months)
    const premiumExpiresAt = new Date();

    if (durationType === "days") {
      premiumExpiresAt.setDate(premiumExpiresAt.getDate() + duration);
    } else {
      premiumExpiresAt.setMonth(premiumExpiresAt.getMonth() + duration);
    }

    await User.findByIdAndUpdate(userId, {
      tier: "premium",
      subscriptionStatus: "active",
      subscriptionStartDate: new Date(),
      subscriptionEndDate: premiumExpiresAt,
      premiumExpiresAt,
    });

    // Process referral purchase reward immediately (idempotent in DB).
    await recordPurchaseEvent(userId);

    console.log(
      `User ${userId} upgraded to premium (${duration} ${durationType}) until ${premiumExpiresAt.toISOString()}`,
    );
  } catch (error) {
    console.error("Error handling payment success:", error);
    // Don't throw - webhook will retry automatically
  }
}

async function handlePaymentFailed(paymentEntity) {
  try {
    if (!paymentEntity) {
      console.error("Webhook payment entity missing");
      return;
    }

    // Check if already recorded (webhook retries)
    const existing = await Payment.findOne({
      paymentId: paymentEntity.id,
    });

    if (existing) {
      console.log(
        "Webhook retry ignored - failed payment already recorded:",
        paymentEntity.id,
      );
      return;
    }

    // Record failed payment for analytics (optional but useful)
    const notes = paymentEntity.notes || {};
    const { duration, durationType, planName } = parsePlanMetadata(notes);
    await Payment.create({
      user: notes.userId,
      orderId: paymentEntity.order_id,
      paymentId: paymentEntity.id,
      amount: paymentEntity.amount,
      planName,
      planDuration: duration,
      planDurationType: durationType,
      currency: paymentEntity.currency,
      status: "failed",
      paymentMethod: paymentEntity.method,
      receipt: paymentEntity.receipt || null,
      notes: JSON.stringify(notes),
    });

    console.log(`Payment ${paymentEntity.id} marked as failed`);
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}

async function handleRefundProcessed(refundEntity) {
  try {
    if (!refundEntity) {
      console.error("Webhook refund entity missing");
      return;
    }
    const payment = await Payment.findOne({
      paymentId: refundEntity.payment_id,
    });

    if (payment) {
      payment.status = "refunded";
      payment.refundId = refundEntity.id;
      payment.refundAmount = refundEntity.amount;
      payment.refundStatus = "processed";
      await payment.save();

      // Downgrade user if full refund
      if (refundEntity.amount >= payment.amount) {
        await User.findByIdAndUpdate(payment.user, {
          tier: "free",
          subscriptionStatus: "expired",
          subscriptionEndDate: null,
          premiumExpiresAt: null,
        });
      }

      console.log(`Refund ${refundEntity.id} processed`);
    }
  } catch (error) {
    console.error("Error handling refund:", error);
  }
}
