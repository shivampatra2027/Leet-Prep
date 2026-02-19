import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * ReferralEvent — one row per reward event.
 * Events are created by API flows and processed by BullMQ workers.
 */
const ReferralEventSchema = new Schema(
  {
    inviterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    inviteeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["signup", "active_next_day", "purchase"],
      required: true,
    },
    points: { type: Number, required: true },
    processed: { type: Boolean, default: false, index: true },
    // Anti-abuse: reject if invitee signed up from the same IP as inviter
    inviteeIp: { type: String },
    inviterIp: { type: String },
    // Set when processed
    processedAt: { type: Date },
    // Set if rejected by anti-abuse
    rejected: { type: Boolean, default: false },
    rejectionReason: { type: String },
  },
  { timestamps: true },
);

// Prevent duplicate events of the same type for the same pair
ReferralEventSchema.index(
  { inviterId: 1, inviteeId: 1, type: 1 },
  { unique: true },
);

const ReferralEvent = mongoose.model("ReferralEvent", ReferralEventSchema);
export default ReferralEvent;
