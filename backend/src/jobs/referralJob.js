/**
 * referralJob.js
 *
 * node-cron handles the weekly referral points reset (zero Redis ops).
 * Signup / active / purchase events are handled by BullMQ workers.
 *
 * Premium expiry is handled entirely by authMiddleware.js — no cron needed.
 */
import cron from "node-cron";
import User from "../models/User.js";
import logger from "../utils/logger.js";

// Every Monday at 00:05 UTC — always runs via cron, not Redis, to save ops.
cron.schedule("5 0 * * 1", async () => {
  try {
    const result = await User.updateMany(
      {},
      { $set: { weeklyPoints: 0, weeklyPointsResetAt: new Date() } },
    );
    logger.info(`Weekly referral points reset: ${result.modifiedCount} users`);
  } catch (err) {
    logger.error("Weekly points reset cron error:", err);
  }
});

logger.info("[referralJob] Weekly reset cron scheduled.");
