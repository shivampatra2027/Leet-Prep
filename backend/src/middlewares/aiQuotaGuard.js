import { AI_QUOTA } from "../config/aiQuota.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";

const FREE_DAILY_CREDITS = AI_QUOTA.freeDailyCredits;
const PREMIUM_DAILY_CREDITS = AI_QUOTA.premiumDailyCredits;
const FREE_COOLDOWN_MS = AI_QUOTA.freeCooldownMs;
const FREE_HEAVY_DAILY_CAP = AI_QUOTA.freeHeavyDailyCap;

function startOfUtcDay(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function isNewUtcDay(lastResetAt, now = new Date()) {
  if (!lastResetAt) return true;
  return startOfUtcDay(lastResetAt).getTime() !== startOfUtcDay(now).getTime();
}

function dailyCreditsForTier(tier) {
  return tier === "premium" ? PREMIUM_DAILY_CREDITS : FREE_DAILY_CREDITS;
}

function nextResetAt(now = new Date()) {
  return new Date(startOfUtcDay(now).getTime() + 24 * 60 * 60 * 1000);
}

function toRetryAfterSeconds(ms) {
  return Math.max(1, Math.ceil(ms / 1000));
}

export async function resetAIQuotaIfNeeded(userId, tier, now = new Date()) {
  const user = await User.findById(userId).select(
    "aiCredits aiCreditsResetAt aiHeavyUsedToday aiLastRequestAt tier",
  );
  if (!user) return null;

  if (!isNewUtcDay(user.aiCreditsResetAt, now)) {
    return user;
  }

  const dailyCredits = dailyCreditsForTier(tier);
  const resetAt = startOfUtcDay(now);

  await User.updateOne(
    { _id: userId },
    {
      $set: {
        aiCredits: dailyCredits,
        aiCreditsResetAt: resetAt,
        aiHeavyUsedToday: 0,
      },
      $unset: {
        aiLastRequestAt: "",
      },
    },
  );

  user.aiCredits = dailyCredits;
  user.aiCreditsResetAt = resetAt;
  user.aiHeavyUsedToday = 0;
  user.aiLastRequestAt = undefined;
  return user;
}

export function aiQuotaGuard() {
  return async (req, res, next) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const now = new Date();
      const user = await resetAIQuotaIfNeeded(userId, req.user.tier, now);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.aiQuota = {
        tier: req.user.tier,
        dailyCredits: dailyCreditsForTier(req.user.tier),
        heavyCap: req.user.tier === "premium" ? null : FREE_HEAVY_DAILY_CAP,
        remainingCredits: user.aiCredits,
        nextResetAt: nextResetAt(now),
      };

      return next();
    } catch (err) {
      logger.error("[ai-quota] guard failed:", err.message);
      return res.status(500).json({ ok: false, message: "AI quota check failed" });
    }
  };
}

export async function consumeAICredits({
  userId,
  tier,
  cost,
  heavy = false,
  requestHash,
}) {
  const now = new Date();
  const current = await resetAIQuotaIfNeeded(userId, tier, now);

  if (!current) {
    return {
      ok: false,
      code: "USER_NOT_FOUND",
      status: 401,
      message: "User not found",
    };
  }

  if (tier !== "premium" && current.aiLastRequestAt) {
    const elapsed = now.getTime() - new Date(current.aiLastRequestAt).getTime();
    if (elapsed < FREE_COOLDOWN_MS) {
      const retryAfter = toRetryAfterSeconds(FREE_COOLDOWN_MS - elapsed);
      return {
        ok: false,
        code: "AI_COOLDOWN",
        status: 429,
        message: `Please wait ${retryAfter}s before the next AI analysis. Premium has no cooldown.`,
        retryAfter,
        quota: {
          tier,
          remainingCredits: current.aiCredits,
          heavyUsedToday: current.aiHeavyUsedToday,
          heavyCap: tier === "premium" ? null : FREE_HEAVY_DAILY_CAP,
          nextResetAt: nextResetAt(now),
        },
      };
    }
  }

  const query = {
    _id: userId,
    aiCredits: { $gte: cost },
  };

  if (tier !== "premium" && heavy) {
    query.aiHeavyUsedToday = { $lt: FREE_HEAVY_DAILY_CAP };
  }

  const update = {
    $inc: {
      aiCredits: -cost,
      ...(tier !== "premium" && heavy ? { aiHeavyUsedToday: 1 } : {}),
    },
    $set: {
      aiLastRequestAt: now,
      aiCreditsResetAt: startOfUtcDay(now),
    },
  };

  if (requestHash) {
    update.$push = {
      aiRecentHashes: {
        $each: [requestHash],
        $slice: -5,
      },
    };
  }

  const updated = await User.findOneAndUpdate(query, update, {
    new: true,
    select: "tier aiCredits aiCreditsResetAt aiHeavyUsedToday",
  });

  if (!updated) {
    const latest = await User.findById(userId).select("aiCredits aiHeavyUsedToday");

    if (latest && tier !== "premium" && heavy && latest.aiHeavyUsedToday >= FREE_HEAVY_DAILY_CAP) {
      return {
        ok: false,
        code: "AI_HEAVY_CAP_REACHED",
        status: 429,
        message: "You reached today's free AI analysis cap. Premium gives 20x more usage.",
        quota: {
          tier,
          remainingCredits: latest.aiCredits,
          heavyUsedToday: latest.aiHeavyUsedToday,
          heavyCap: FREE_HEAVY_DAILY_CAP,
          nextResetAt: nextResetAt(now),
        },
      };
    }

    return {
      ok: false,
      code: "AI_CREDITS_EXHAUSTED",
      status: 402,
      message: "You've reached today's free AI limit. Premium gives much higher daily credits.",
      quota: {
        tier,
        remainingCredits: latest?.aiCredits ?? 0,
        heavyUsedToday: latest?.aiHeavyUsedToday ?? 0,
        heavyCap: tier === "premium" ? null : FREE_HEAVY_DAILY_CAP,
        nextResetAt: nextResetAt(now),
      },
    };
  }

  return {
    ok: true,
    quota: {
      tier: updated.tier,
      remainingCredits: updated.aiCredits,
      heavyUsedToday: updated.aiHeavyUsedToday,
      heavyCap: updated.tier === "premium" ? null : FREE_HEAVY_DAILY_CAP,
      nextResetAt: nextResetAt(now),
    },
  };
}
