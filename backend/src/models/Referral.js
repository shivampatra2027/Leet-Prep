import mongoose from "mongoose";
const { Schema } = mongoose;

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
    processAfter: { type: Date, default: Date.now, index: true },
    inviteeIp: { type: String },
    inviterIp: { type: String },
    processedAt: { type: Date },
    rejected: { type: Boolean, default: false, index: true },
    rejectionReason: { type: String },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

ReferralEventSchema.index(
  { inviterId: 1, inviteeId: 1, type: 1 },
  { unique: true }
);

ReferralEventSchema.index(
  { inviterId: 1, inviteeId: 1, type: 1, processed: 1 },
  { partialFilterExpression: { processed: false } }
);

ReferralEventSchema.index({ processed: 1, rejected: 1, processAfter: 1 });

ReferralEventSchema.index(
  { inviterId: 1, inviteeId: 1, type: 1, processed: 1, rejected: 1 }
);

ReferralEventSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ReferralEvent = mongoose.model("ReferralEvent", ReferralEventSchema);
export default ReferralEvent;
