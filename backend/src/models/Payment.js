import mongoose from "mongoose";
const { Schema } = mongoose;

const PaymentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    paymentId: {
      type: String,
      sparse: true,
    },
    signature: {
      type: String,
      sparse: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    planName: {
      type: String,
      trim: true,
    },
    planDuration: {
      type: Number,
      min: 1,
    },
    planDurationType: {
      type: String,
      enum: ["days", "months"],
      default: "months",
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: [
        "created",
        "pending",
        "authorized",
        "captured",
        "refunded",
        "failed",
      ],
      default: "created",
      index: true,
    },
    paymentMethod: {
      type: String, // card, netbanking, upi, wallet, etc.
    },
    subscriptionId: {
      type: String,
      sparse: true,
    },
    refundId: {
      type: String,
      sparse: true,
    },
    refundAmount: {
      type: Number,
    },
    refundStatus: {
      type: String,
      enum: ["none", "pending", "processed", "failed"],
      default: "none",
    },
    metadata: {
      type: Map,
      of: String,
    },
    notes: {
      type: String,
    },
    receipt: {
      type: String,
    },
    capturedAt: {
      type: Date,
      index: true, // For revenue reports
    },
  },
  { timestamps: true },
);

// Indexes for efficient querying
PaymentSchema.index({ user: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

const Payment =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
export default Payment;
