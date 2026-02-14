import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";
import Payment from "../models/Payment.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a new Razorpay order
 * @route POST /api/payment/create-order
 * @access Private
 */
export const createOrder = async (req, res) => {
  try {
    const { amount = 99900, currency = "INR", notes } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const options = {
      amount,
      currency,
      receipt: `receipt_${Date.now()}_${req.user._id}`,
      notes: notes || { userId: req.user._id.toString() },
    };

    const order = await razorpay.orders.create(options);

    // Save payment record in database
    await Payment.create({
      user: req.user._id,
      orderId: order.id,
      amount: amount,
      currency: currency,
      status: "created",
      receipt: options.receipt,
      notes: JSON.stringify(notes),
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
    });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res
      .status(500)
      .json({ error: "Failed to create order", message: err.message });
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

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      // Update payment status to failed
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: "failed" },
      );
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    // Update payment record
    const paymentRecord = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: payment.status === "captured" ? "captured" : "authorized",
        paymentMethod: payment.method,
      },
      { new: true },
    );

    if (!paymentRecord) {
      return res
        .status(404)
        .json({ success: false, message: "Payment record not found" });
    }

    // Calculate premium expiry based on duration from payment notes
    let durationMonths = 1; // Default to 1 month

    if (paymentRecord.notes) {
      try {
        const notes = JSON.parse(paymentRecord.notes);
        if (notes.duration) {
          durationMonths = parseInt(notes.duration);
        }
      } catch (e) {
        console.log("Could not parse payment notes, using default duration");
      }
    }

    // Update user to premium (based on duration: 1 or 2 months)
    const premiumExpiresAt = new Date();
    premiumExpiresAt.setMonth(premiumExpiresAt.getMonth() + durationMonths);

    await User.findByIdAndUpdate(req.user._id, {
      tier: "premium",
      premiumExpiresAt: premiumExpiresAt,
    });

    console.log(
      `User ${req.user._id} upgraded to premium until ${premiumExpiresAt.toISOString()} (${durationMonths} month${durationMonths > 1 ? "s" : ""})`,
    );

    return res.json({
      success: true,
      message: "Payment verified successfully",
      premiumExpiresAt,
      duration: durationMonths,
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

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Optionally fetch latest status from Razorpay if payment ID exists
    if (payment.paymentId) {
      try {
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

    // Process refund with Razorpay
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
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (!webhookSecret) {
      console.error("Webhook secret not configured");
      return res.status(500).json({ error: "Webhook not configured" });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Invalid webhook signature");
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`Webhook received: ${event}`);

    // Handle different webhook events
    switch (event) {
      case "payment.authorized":
      case "payment.captured":
        await handlePaymentSuccess(payload.payment.entity);
        break;

      case "payment.failed":
        await handlePaymentFailed(payload.payment.entity);
        break;

      case "refund.created":
      case "refund.processed":
        await handleRefundProcessed(payload.refund.entity);
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
    const payment = await Payment.findOne({ orderId: paymentEntity.order_id });

    if (payment) {
      payment.paymentId = paymentEntity.id;
      payment.status = paymentEntity.status;
      payment.paymentMethod = paymentEntity.method;
      await payment.save();

      // Update user to premium
      const premiumExpiresAt = new Date();
      premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 30);

      await User.findByIdAndUpdate(payment.user, {
        tier: "premium",
        premiumExpiresAt,
      });

      console.log(`Payment ${paymentEntity.id} marked as successful`);
    }
  } catch (error) {
    console.error("Error handling payment success:", error);
  }
}

async function handlePaymentFailed(paymentEntity) {
  try {
    await Payment.findOneAndUpdate(
      { orderId: paymentEntity.order_id },
      {
        paymentId: paymentEntity.id,
        status: "failed",
        paymentMethod: paymentEntity.method,
      },
    );
    console.log(`Payment ${paymentEntity.id} marked as failed`);
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}

async function handleRefundProcessed(refundEntity) {
  try {
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
          premiumExpiresAt: null,
        });
      }

      console.log(`Refund ${refundEntity.id} processed`);
    }
  } catch (error) {
    console.error("Error handling refund:", error);
  }
}
