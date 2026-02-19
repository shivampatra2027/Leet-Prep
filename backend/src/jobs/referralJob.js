import cron from "node-cron";
import User from "../models/User.js";
import mongoose from "mongoose";
import logger from "../utils/logger.js";

const LOCK_ID = "weekly_referral_reset";

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
