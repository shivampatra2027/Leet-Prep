import crypto from "crypto";
import User from "../models/User.js";
import ReferralEvent from "../models/Referral.js";
import logger from "../utils/logger.js";
import { referralQueue } from "../queues/index.js";

// ─── Points config ──────────────────────────────────────────────────────
export const POINTS = {
  signup: 1,
  active_next_day: 5,
  purchase: 50,
};

// Points required for premium redemption tiers
export const REDEMPTION_TIERS = [
  {
    id: "premium_7",
    points: 2000,
    days: 7,
    label: "7-day Premium",
    type: "premium",
  },
  {
    id: "premium_30",
    points: 5000,
    days: 30,
    label: "30-day Premium",
    type: "premium",
  },
  {
    id: "iphone_17",
    points: 10000,
    label: "Apple iPhone 17",
    icon: "📱",
    type: "physical",
    description: "Apple iPhone 17, 128GB — latest model",
  },
  {
    id: "macbook_air",
    points: 20000,
    label: "Apple MacBook Air",
    icon: "💻",
    type: "physical",
    description: "MacBook Air 512GB SSD - latest model",
  },
];

// Badge thresholds
const SIGNUP_BADGE_MILESTONES = [1, 10, 100];
const PURCHASE_BADGE_MILESTONES = [1, 10];
const POINTS_BADGE_MILESTONES = [1000, 5000];

const SIGNUP_BADGE_MAP = {
  1: "first_referral",
  10: "ten_referrals",
  100: "hundred_referrals",
};
const PURCHASE_BADGE_MAP = {
  1: "first_purchase",
  10: "ten_purchases",
};
const POINTS_BADGE_MAP = {
  1000: "points_1000",
  5000: "points_5000",
};

const REFERRAL_COUNTER_FIELD = {
  signup: "referralSignupCount",
  purchase: "referralPurchaseCount",
};

// ─── Helpers ────────────────────────────────────────────────────────────

/**
 * Generate a unique referral code from a display name.
 * Format: firstname-XXXXX  (5 random uppercase alphanumeric chars)
 */
export function generateReferralCode(name = "user") {
  const firstName =
    (name || "user")
      .split(/\s+/)[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 10) || "user";
  const suffix = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()
    .slice(0, 5);
  return `${firstName}-${suffix}`;
}

/** Ensure user has a referralCode, generate one if missing. Idempotent. */
export async function ensureReferralCode(userId) {
  const user = await User.findById(userId);
  if (!user) return null;
  if (user.referralCode) return user.referralCode;

  // Try up to 5 times in case of collision
  for (let i = 0; i < 5; i++) {
    const code = generateReferralCode(user.name);
    try {
      user.referralCode = code;
      await user.save();
      return code;
    } catch (err) {
      if (err.code !== 11000) throw err; // only retry on duplicate key
    }
  }
  throw new Error("Could not generate unique referral code");
}

/**
 * Award badges to inviter based on current totals.
 * Called after processing any referral event.
 */
async function awardBadges(user) {
  if (!user) return;
  const existing = new Set(user.badges.map((b) => b.type));
  const toAdd = [];

  const signupCount = user.referralSignupCount || 0;
  for (const milestone of SIGNUP_BADGE_MILESTONES) {
    const badge = SIGNUP_BADGE_MAP[milestone];
    if (signupCount >= milestone && !existing.has(badge)) toAdd.push(badge);
  }

  const purchaseCount = user.referralPurchaseCount || 0;
  for (const milestone of PURCHASE_BADGE_MILESTONES) {
    const badge = PURCHASE_BADGE_MAP[milestone];
    if (purchaseCount >= milestone && !existing.has(badge)) toAdd.push(badge);
  }

  // Points milestone badges (use current total)
  for (const milestone of POINTS_BADGE_MILESTONES) {
    const badge = POINTS_BADGE_MAP[milestone];
    if (user.referralPoints >= milestone && !existing.has(badge))
      toAdd.push(badge);
  }

  if (toAdd.length > 0) {
    await User.findByIdAndUpdate(user._id, {
      $push: {
        badges: {
          $each: toAdd.map((type) => ({ type, earnedAt: new Date() })),
        },
      },
    });
  }
}

function getReferralQueue() {
  if (!referralQueue) {
    throw new Error("Referral queue is unavailable");
  }
  return referralQueue;
}

// ─── Controllers ────────────────────────────────────────────────────────

/**
 * GET /api/referral/me
 * Return current user's referral stats, code, link, badges.
 * If user has never joined, return { joined: false } without creating anything.
 */
export const getMyReferral = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      "name referralCode referralPoints referralSignupCount referralPurchaseCount weeklyPoints badges loginCount prizeClaims",
    );

    // Not joined yet — return a lightweight response so the frontend shows the join CTA
    if (!user?.referralCode) {
      return res.json({ joined: false });
    }

    const code = user.referralCode;
    const siteUrl = (
      process.env.CORS_ORIGIN || "https://leetcodepremium.xyz"
    ).replace(/\/$/, "");
    const referralUrl = `${siteUrl}/r/${code}`;

    const pendingEvents = await ReferralEvent.countDocuments({
      inviterId: userId,
      processed: false,
      rejected: false,
    });

    // Recent referees (last 10)
    const recentEvents = await ReferralEvent.find({
      inviterId: userId,
      processed: true,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("inviteeId", "name avatar createdAt");

    res.json({
      success: true,
      referralCode: code,
      referralUrl,
      stats: {
        totalSignups: user.referralSignupCount || 0,
        totalPurchases: user.referralPurchaseCount || 0,
        pendingEvents,
        totalPoints: user.referralPoints,
        weeklyPoints: user.weeklyPoints,
      },
      badges: user.badges,
      recentReferrals: recentEvents.map((e) => ({
        type: e.type,
        points: e.points,
        name: e.inviteeId?.name,
        avatar: e.inviteeId?.avatar,
        date: e.createdAt,
      })),
      redemptionTiers: REDEMPTION_TIERS,
      prizeClaims: user.prizeClaims || [],
      joined: true,
    });
  } catch (err) {
    logger.error("getMyReferral error:", err);
    res.status(500).json({ error: "Failed to fetch referral data" });
  }
};

/**
 * POST /api/referral/join
 * Explicitly enroll: generates a referral code for the user on demand.
 * Idempotent — safe to call more than once.
 */
export const joinReferral = async (req, res) => {
  try {
    const code = await ensureReferralCode(req.user._id);
    const user = await User.findById(req.user._id).select("name");
    const siteUrl = (
      process.env.CORS_ORIGIN || "https://leetcodepremium.xyz"
    ).replace(/\/$/, "");
    res.json({
      success: true,
      referralCode: code,
      referralUrl: `${siteUrl}/r/${code}`,
      name: user?.name,
    });
  } catch (err) {
    logger.error("joinReferral error:", err);
    res.status(500).json({ error: "Failed to create referral code" });
  }
};

/**
 * POST /api/referral/apply
 * Called by frontend after login if localStorage has a `pendingReferral` code.
 * Links invitee to inviter and queues a signup event (with 10-min delay + anti-abuse).
 */
export const applyReferral = async (req, res) => {
  try {
    const inviteeId = req.user._id;
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Referral code required" });
    }

    // Already referred?
    const invitee = await User.findById(inviteeId);
    if (!invitee) return res.status(404).json({ error: "User not found" });
    if (invitee.referredBy) {
      return res.json({ success: true, message: "Already applied" });
    }

    // Find inviter
    const inviter = await User.findOne({ referralCode: code.trim() });
    if (!inviter) {
      return res.status(404).json({ error: "Invalid referral code" });
    }

    // Self-referral guard
    if (inviter._id.toString() === inviteeId.toString()) {
      return res.status(400).json({ error: "Cannot refer yourself" });
    }

    // Record referredBy
    await User.findByIdAndUpdate(inviteeId, { referredBy: inviter._id });

    // Queue signup event with 10-min delay
    const inviteeIp =
      req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim();
    const inviterIp = inviter.lastIp;

    await ReferralEvent.findOneAndUpdate(
      { inviterId: inviter._id, inviteeId, type: "signup" },
      {
        $setOnInsert: {
          inviterId: inviter._id,
          inviteeId,
          type: "signup",
          points: POINTS.signup,
          inviteeIp,
          inviterIp,
        },
      },
      { upsert: true, new: true },
    );

    // Dispatch signup job — worker will re-check loginCount >= 2 + same-IP guard
    await getReferralQueue().add(
      "referral.signup",
      {
        inviterId: inviter._id.toString(),
        inviteeId: inviteeId.toString(),
        inviteeIp,
        inviterIp,
      },
      {
        delay: 10 * 60 * 1000, // 10-minute delay
        jobId: `signup-${inviter._id}-${inviteeId}`,
        attempts: 24,
        backoff: { type: "fixed", delay: 5 * 60 * 1000 },
      },
    );

    res.json({ success: true, message: "Referral applied" });
  } catch (err) {
    logger.error("applyReferral error:", err);
    if (err.message === "Referral queue is unavailable") {
      return res.status(503).json({ error: "Referral service unavailable" });
    }
    res.status(500).json({ error: "Failed to apply referral" });
  }
};

/**
 * GET /api/referral/leaderboard
 * Weekly top 20 + all-time top 20
 */
export const getLeaderboard = async (req, res) => {
  try {
    const [weekly, allTime] = await Promise.all([
      User.find({ weeklyPoints: { $gt: 0 } })
        .select("name avatar weeklyPoints referralCode")
        .sort({ weeklyPoints: -1 })
        .limit(20),
      User.find({ referralPoints: { $gt: 0 } })
        .select("name avatar referralPoints referralCode badges")
        .sort({ referralPoints: -1 })
        .limit(20),
    ]);

    res.json({
      success: true,
      weekly: weekly.map((u, i) => ({
        rank: i + 1,
        name: u.name,
        avatar: u.avatar,
        points: u.weeklyPoints,
        code: u.referralCode,
      })),
      allTime: allTime.map((u, i) => ({
        rank: i + 1,
        name: u.name,
        avatar: u.avatar,
        points: u.referralPoints,
        code: u.referralCode,
        badges: u.badges?.map((b) => b.type),
      })),
    });
  } catch (err) {
    logger.error("getLeaderboard error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

/**
 * POST /api/referral/redeem
 * Redeem points for premium days.
 */
export const redeemPoints = async (req, res) => {
  try {
    const userId = req.user._id;
    const { tierId } = req.body; // string id from REDEMPTION_TIERS

    const tier = REDEMPTION_TIERS.find((t) => t.id === tierId);
    if (!tier) return res.status(400).json({ error: "Invalid tier" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.referralPoints < tier.points) {
      return res.status(400).json({
        error: "Insufficient points",
        required: tier.points,
        current: user.referralPoints,
      });
    }

    const pointsDeduct = tier.points;
    const weeklyDeduct = Math.min(user.weeklyPoints, pointsDeduct);

    // ── Physical prize claim ─────────────────────────────────────────────
    if (tier.type === "physical") {
      // Check if already claimed and still pending
      const alreadyClaimed = user.prizeClaims?.some(
        (c) => c.prize === tier.id && c.status === "pending",
      );
      if (alreadyClaimed) {
        return res.status(400).json({
          error:
            "You already have a pending claim for this prize. Contact support.",
        });
      }

      await User.findByIdAndUpdate(userId, {
        $inc: { referralPoints: -pointsDeduct, weeklyPoints: -weeklyDeduct },
        $push: {
          prizeClaims: {
            prize: tier.id,
            label: tier.label,
            points: tier.points,
            claimedAt: new Date(),
            status: "pending",
          },
        },
      });

      logger.info(`User ${userId} claimed physical prize: ${tier.id}`);

      return res.json({
        success: true,
        physical: true,
        prize: tier.id,
        message: `🎉 ${tier.label} claim recorded! Email soulintrovert0@gmail.com with your shipping address and order ID: ${userId}.`,
        remainingPoints: user.referralPoints - pointsDeduct,
      });
    }

    // ── Premium days redemption ──────────────────────────────────────────
    const now = new Date();
    const currentExpiry =
      user.premiumExpiresAt && user.premiumExpiresAt > now
        ? user.premiumExpiresAt
        : now;
    const newExpiry = new Date(
      currentExpiry.getTime() + tier.days * 24 * 60 * 60 * 1000,
    );

    await User.findByIdAndUpdate(userId, {
      $inc: { referralPoints: -pointsDeduct, weeklyPoints: -weeklyDeduct },
      tier: "premium",
      premiumExpiresAt: newExpiry,
    });

    logger.info(
      `User ${userId} redeemed ${tier.points} points for ${tier.days} premium days`,
    );

    res.json({
      success: true,
      message: `${tier.days} days of premium unlocked!`,
      newExpiry,
      remainingPoints: user.referralPoints - pointsDeduct,
    });
  } catch (err) {
    logger.error("redeemPoints error:", err);
    res.status(500).json({ error: "Failed to redeem points" });
  }
};

/**
 * Internal: record purchase event for referral.
 * Called from paymentController.handlePaymentSuccess.
 */
export async function recordPurchaseEvent(userId) {
  try {
    const user = await User.findById(userId).select("referredBy lastIp");
    if (!user?.referredBy) return; // not referred

    const inviterId = user.referredBy;
    const inviter = await User.findById(inviterId).select("lastIp");

    // Anti-abuse: same IP?
    if (user.lastIp && inviter?.lastIp && user.lastIp === inviter.lastIp) {
      logger.warn(
        `Referral purchase event blocked (same IP): inviter=${inviterId} invitee=${userId}`,
      );
      return;
    }

    await ReferralEvent.findOneAndUpdate(
      { inviterId, inviteeId: userId, type: "purchase" },
      {
        $setOnInsert: {
          inviterId,
          inviteeId: userId,
          type: "purchase",
          points: POINTS.purchase,
          inviteeIp: user.lastIp,
          inviterIp: inviter?.lastIp,
        },
      },
      { upsert: true, new: true },
    );

    await getReferralQueue().add(
      "referral.purchase",
      {
        inviterId: inviterId.toString(),
        inviteeId: userId.toString(),
        points: POINTS.purchase,
      },
      {
        jobId: `purchase-${inviterId}-${userId}`,
      },
    );
  } catch (err) {
    logger.error("recordPurchaseEvent error:", err);
  }
}

/**
 * Internal: record active_next_day event.
 * Called from authMiddleware when invitee logs in on the day after signup.
 */
export async function recordActiveDayEvent(userId) {
  try {
    const user = await User.findById(userId).select(
      "referredBy lastIp createdAt",
    );
    if (!user?.referredBy) return;

    const inviterId = user.referredBy;
    const inviter = await User.findById(inviterId).select("lastIp");

    // Only award if login is the day AFTER account creation
    const createdDay = new Date(user.createdAt).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    if (today <= createdDay) return; // same day, skip

    if (user.lastIp && inviter?.lastIp && user.lastIp === inviter.lastIp)
      return;

    await ReferralEvent.findOneAndUpdate(
      { inviterId, inviteeId: userId, type: "active_next_day" },
      {
        $setOnInsert: {
          inviterId,
          inviteeId: userId,
          type: "active_next_day",
          points: POINTS.active_next_day,
          inviteeIp: user.lastIp,
          inviterIp: inviter?.lastIp,
        },
      },
      { upsert: true, new: true },
    );

    await getReferralQueue().add(
      "referral.active",
      {
        inviterId: inviterId.toString(),
        inviteeId: userId.toString(),
        points: POINTS.active_next_day,
      },
      {
        jobId: `active-${inviterId}-${userId}`,
      },
    );
  } catch (err) {
    logger.error("recordActiveDayEvent error:", err);
  }
}

/**
 * Internal: process a single pending event in worker context.
 */
export async function processEvent({ inviterId, inviteeId, type, points }) {
  const event = await ReferralEvent.findOneAndUpdate(
    {
      inviterId,
      inviteeId,
      type,
      processed: false,
      rejected: false,
    },
    { processed: true, processedAt: new Date() },
    { new: true },
  );

  if (!event) {
    logger.info(
      `Referral event skipped (already handled): ${type} inviter=${inviterId} invitee=${inviteeId}`,
    );
    return;
  }

  const inc = { referralPoints: points, weeklyPoints: points };
  const counterField = REFERRAL_COUNTER_FIELD[type];
  if (counterField) {
    inc[counterField] = 1;
  }

  const inviter = await User.findByIdAndUpdate(
    inviterId,
    { $inc: inc },
    {
      new: true,
      select:
        "_id badges referralPoints referralSignupCount referralPurchaseCount",
    },
  );

  await awardBadges(inviter);
  logger.info(`Referral event processed: ${type} +${points}pts -> ${inviterId}`);
}

