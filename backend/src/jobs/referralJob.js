import cron from "node-cron";
import User from "../models/User.js";
import ReferralEvent from "../models/Referral.js";
import mongoose from "mongoose";
import logger from "../utils/logger.js";
import { processEvent, POINTS } from "../controllers/referralController.js";

const LOCK_ID = "weekly_referral_reset";
let referralScanRunning = false;

async function runWeeklyReset() {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const lock = await mongoose.connection.collection("cronlocks").findOneAndUpdate(
        { _id: LOCK_ID, week: getWeekKey() },
        { $setOnInsert: { createdAt: new Date() } },
        { upsert: true, returnDocument: "before", session }
      );

      if (lock.value) {
        logger.info("Weekly reset already executed by another instance");
        return;
      }

      const result = await User.updateMany(
        {},
        { $set: { weeklyPoints: 0, weeklyPointsResetAt: new Date() } },
        { session }
      );

      logger.info(`Weekly referral points reset: ${result.modifiedCount} users`);
    });
  } catch (err) {
    logger.error("Weekly points reset cron error:", err);
  } finally {
    session.endSession();
  }
}

function getWeekKey() {
  const d = new Date();
  const year = d.getUTCFullYear();
  const week = Math.ceil(((d - Date.UTC(year, 0, 1)) / 86400000 + 1) / 7);
  return `${year}-${week}`;
}

cron.schedule("5 0 * * 1", runWeeklyReset, { timezone: "UTC" });

logger.info("[referralJob] Weekly reset cron scheduled.");

async function processPendingReferralEvents() {
  if (referralScanRunning) return;
  referralScanRunning = true;

  try {
    const now = new Date();
    const events = await ReferralEvent.find({
      processed: false,
      rejected: false,
      type: { $in: ["signup", "active_next_day"] },
      processAfter: { $lte: now },
    })
      .sort({ processAfter: 1 })
      .limit(100)
      .lean();

    for (const event of events) {
      if (event.type === "signup") {
        const invitee = await User.findById(event.inviteeId).select("loginCount lastIp");
        if (!invitee || invitee.loginCount < 2) {
          await ReferralEvent.updateOne(
            { _id: event._id, processed: false, rejected: false },
            { $set: { processAfter: new Date(Date.now() + 5 * 60 * 1000) } },
          );
          continue;
        }

        const effectiveInviteeIp = invitee.lastIp || event.inviteeIp;
        if (
          effectiveInviteeIp &&
          event.inviterIp &&
          effectiveInviteeIp === event.inviterIp
        ) {
          await ReferralEvent.updateOne(
            { _id: event._id, processed: false, rejected: false },
            {
              $set: {
                rejected: true,
                rejectionReason: "same_ip",
                processed: true,
                processedAt: new Date(),
              },
            },
          );
          continue;
        }

        await processEvent({
          inviterId: event.inviterId,
          inviteeId: event.inviteeId,
          type: "signup",
          points: POINTS.signup,
        });
        continue;
      }

      if (event.type === "active_next_day") {
        await processEvent({
          inviterId: event.inviterId,
          inviteeId: event.inviteeId,
          type: "active_next_day",
          points: POINTS.active_next_day,
        });
      }
    }
  } catch (err) {
    logger.error("Pending referral scan error:", err);
  } finally {
    referralScanRunning = false;
  }
}

cron.schedule("*/30 * * * *", processPendingReferralEvents, {
  timezone: "UTC",
});
logger.info("[referralJob] Pending referral cron scheduled (every 30 minutes).");
