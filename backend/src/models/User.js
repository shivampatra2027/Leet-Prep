import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * USER MODEL - DUPLICATE PREVENTION
 *
 * Key fields for uniqueness:
 * - email: unique, sparse index (primary identifier)
 * - googleId: sparse index (for OAuth lookups)
 *
 * Sparse indexes allow multiple null values but ensure uniqueness when value exists
 * This prevents duplicate users while allowing flexibility in auth methods
 *
 * Always use findOneAndUpdate with upsert for user creation to prevent race conditions
 */

const AttemptSchema = new Schema(
  {
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: false },
    problemId: { type: String, required: false },
    status: {
      type: String,
      enum: ["unsolved", "attempted", "solved"],
      default: "unsolved",
    },
    language: String,
    notes: String,
    lastAttemptAt: Date,
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  },
  { _id: false },
);

const UserSchema = new Schema(
  {
    email: { type: String, unique: true, sparse: true, index: true },
    name: String,
    passwordHash: String,
    googleId: { type: String, sparse: true, index: true }, // Google OAuth ID
    avatar: String, // Profile picture URL
    isAdmin: { type: Boolean, default: false },
    tier: { type: String, enum: ["free", "premium"], default: "free" },
    attempts: [AttemptSchema],
    leetcodeUsername: { type: String, sparse: true },
    solvedProblems: [{ type: String }], // Array of LeetCode problem slugs or IDs
    lastLeetcodeSync: { type: Date },
    expireAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    // Subscription fields
    subscriptionId: { type: String, sparse: true },
    subscriptionStatus: {
      type: String,
      enum: ["none", "active", "paused", "cancelled", "expired"],
      default: "none",
    },
    subscriptionStartDate: { type: Date },
    subscriptionEndDate: { type: Date },
    premiumExpiresAt: { type: Date },

    // AI quota fields
    aiCredits: { type: Number, default: 100 },
    aiCreditsResetAt: { type: Date, default: Date.now },
    aiLastRequestAt: { type: Date },
    aiHeavyUsedToday: { type: Number, default: 0 },
    aiRecentHashes: [{ type: String }],

    // ── Referral system ─────────────────────────────────────────────────────
    referralCode: { type: String, unique: true, sparse: true, index: true },
    referredBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    referralPoints: { type: Number, default: 0 },
    referralSignupCount: { type: Number, default: 0 },
    referralPurchaseCount: { type: Number, default: 0 },
    weeklyPoints: { type: Number, default: 0 },
    weeklyPointsResetAt: { type: Date, default: Date.now },
    // Login tracking for anti-abuse ("2nd login" rule) and active_next_day reward
    loginCount: { type: Number, default: 0 },
    loginDates: [{ type: Date }], // last 5 login dates (UTC day)
    // Last known IP for anti-abuse cross-referral detection
    lastIp: { type: String },
    // Milestone badges
    badges: [
      {
        type: {
          type: String,
          enum: [
            "first_referral",
            "ten_referrals",
            "hundred_referrals",
            "first_purchase",
            "ten_purchases",
            "points_1000",
            "points_5000",
          ],
        },
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    // Physical prize claims
    prizeClaims: [
      {
        prize: { type: String },
        label: { type: String },
        points: { type: Number },
        claimedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "shipped", "delivered", "cancelled"],
          default: "pending",
        },
      },
    ],
  },
  { timestamps: true },
);

// TTL index
UserSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
UserSchema.index({ weeklyPoints: -1 });
UserSchema.index({ referralPoints: -1 });

UserSchema.methods.upsertAttempt = function (attemptObj) {
  const { problemId, status, language, notes } = attemptObj;

  const idx = this.attempts.findIndex(
    (a) =>
      (a.problemId && a.problemId === problemId) ||
      (a.problem &&
        a.problem.toString() ===
          (attemptObj.problem ? attemptObj.problem.toString() : null)),
  );

  // Example: enforce free tier limit per company
  const attemptsForCompany = this.attempts.filter(
    (a) => a.companyId.toString() === attemptObj.companyId.toString(),
  );
  if (this.tier === "free" && attemptsForCompany.length >= 10) {
    throw new Error("Premium required to attempt for this company");
  }

  if (idx === -1) {
    this.attempts.push({
      problemId,
      companyId: attemptObj.companyId,
      status,
      language,
      notes,
      lastAttemptAt: new Date(),
    });
  } else {
    this.attempts[idx].status = status || this.attempts[idx].status;
    this.attempts[idx].language = language || this.attempts[idx].language;
    this.attempts[idx].notes = notes || this.attempts[idx].notes;
    this.attempts[idx].lastAttemptAt = new Date();
  }
  return this.save();
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;

