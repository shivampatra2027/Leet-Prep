import cron from "node-cron";
import ReferralEvent from "../models/Referral.js";
import User from "../models/User.js";
import { processEvent } from "../controllers/referralController.js";
import logger from "../utils/logger.js";

/**
 * Every 5 minutes: process pending referral signup / active_next_day events
 * that have passed their processAfter delay AND the invitee has logged in >= 2 times.
 */
cron.schedule("*/5 * * * *", async () => {
  try {
    const pending = await ReferralEvent.find({
      processed: false,
      rejected: false,
      processAfter: { $lte: new Date() },
      type: { $in: ["signup", "active_next_day"] },
    }).limit(200);

    for (const event of pending) {
      try {
        // Anti-abuse: require invitee's second login before awarding signup point
        if (event.type === "signup") {
          const invitee = await User.findById(event.inviteeId).select(
            "loginCount lastIp",
          );
          if (!invitee || invitee.loginCount < 2) continue; // not yet eligible

          // Same-IP guard (double check at processing time)
          if (
            event.inviteeIp &&
            event.inviterIp &&
            event.inviteeIp === event.inviterIp
          ) {
            await ReferralEvent.findByIdAndUpdate(event._id, {
              rejected: true,
              rejectionReason: "same_ip",
              processed: true,
              processedAt: new Date(),
            });
            logger.warn(`Referral signup rejected (same IP): ${event._id}`);
            continue;
          }
        }

        await processEvent({
          inviterId: event.inviterId,
          inviteeId: event.inviteeId,
          type: event.type,
          points: event.points,
        });
      } catch (err) {
        logger.error(`Failed to process referral event ${event._id}:`, err);
      }
    }
  } catch (err) {
    logger.error("Referral cron error:", err);
  }
});

/**
 * Every Monday at 00:05 UTC: reset weeklyPoints to 0 for all users.
 */
cron.schedule("5 0 * * 1", async () => {
  try {
    const result = await User.updateMany(
      {},
      {
        $set: { weeklyPoints: 0, weeklyPointsResetAt: new Date() },
      },
    );
    logger.info(`Weekly referral points reset: ${result.modifiedCount} users`);
  } catch (err) {
    logger.error("Weekly points reset cron error:", err);
  }
});

logger.info("Referral cron jobs scheduled.");
