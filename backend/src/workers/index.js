/**
 * BullMQ Workers
 *
 * Only the referral queue uses BullMQ/Redis.
 * Premium expiry is handled inline by authMiddleware (no queue needed).
 * Weekly referral reset is handled by node-cron in referralJob.js (no Redis ops).
 *
 * Redis op budget (Upstash free: 300k/month):
 *   drainDelay=300s  → 1 BLPOP poll per 5 min when queue is empty
 *   stalledInterval=300s → stalled-job check every 5 min
 *   Total idle cost ≈ 17k ops/month, leaving ~283k for actual jobs.
 *
 * Job types handled (referral queue):
 *   - referral.signup     { inviterId, inviteeId, inviteeIp, inviterIp }
 *   - referral.active_day { inviterId, inviteeId }
 *   - referral.purchase   { inviterId, inviteeId }
 */
import { Worker } from "bullmq";
import { connectionCfg, queuesEnabled } from "../queues/index.js";
import ReferralEvent from "../models/Referral.js";
import User from "../models/User.js";
import { processEvent, POINTS } from "../controllers/referralController.js";
import logger from "../utils/logger.js";

// ── Referral worker ──────────────────────────────────────────────────────────
async function handleReferralJob(job) {
  const { name, data } = job;

  // ── referral.signup ──────────────────────────────────────────────────
  if (name === "referral.signup") {
    const { inviterId, inviteeId, inviteeIp, inviterIp } = data;

    // Anti-abuse: require invitee's 2nd login
    const invitee = await User.findById(inviteeId).select("loginCount lastIp");
    if (!invitee || invitee.loginCount < 2) {
      logger.info(
        `[worker] referral.signup deferred — invitee ${inviteeId} loginCount < 2`,
      );
      // Re-queue with another 5-min delay so it retries naturally
      throw new Error("DEFER: invitee not yet eligible");
    }

    // Same-IP guard
    const effectiveInviteeIp = invitee.lastIp || inviteeIp;
    if (effectiveInviteeIp && inviterIp && effectiveInviteeIp === inviterIp) {
      await ReferralEvent.findOneAndUpdate(
        { inviterId, inviteeId, type: "signup" },
        {
          rejected: true,
          rejectionReason: "same_ip",
          processed: true,
          processedAt: new Date(),
        },
      );
      logger.warn(
        `[worker] referral.signup rejected (same IP) invitee=${inviteeId}`,
      );
      return;
    }

    await processEvent({
      inviterId,
      inviteeId,
      type: "signup",
      points: POINTS.signup,
    });
    return;
  }

  // ── referral.active_day ──────────────────────────────────────────────
  if (name === "referral.active_day") {
    const { inviterId, inviteeId } = data;
    await processEvent({
      inviterId,
      inviteeId,
      type: "active_next_day",
      points: POINTS.active_next_day,
    });
    return;
  }

  // ── referral.purchase ────────────────────────────────────────────────
  if (name === "referral.purchase") {
    const { inviterId, inviteeId } = data;
    await processEvent({
      inviterId,
      inviteeId,
      type: "purchase",
      points: POINTS.purchase,
    });
    return;
  }

  logger.warn(`[worker] Unknown referral job: ${name}`);
}

// ── Boot workers ─────────────────────────────────────────────────────────────
let referralWorker = null;

export function startWorkers() {
  if (!queuesEnabled) {
    logger.info("[workers] Redis not available — skipping BullMQ workers.");
    return;
  }

  referralWorker = new Worker("referral", handleReferralJob, {
    connection: connectionCfg,
    concurrency: 1, // one job at a time — no burst Redis ops
    drainDelay: 300_000, // wait 5 min before re-polling an empty queue
    stalledInterval: 300_000, // check for stalled jobs every 5 min
    lockDuration: 300_000, // job lock lasts 5 min — fewer renewal ops
  });

  referralWorker.on("completed", (job) =>
    logger.info(`[worker] referral job done: ${job.name} (${job.id})`),
  );
  referralWorker.on("failed", (job, err) => {
    // DEFER errors are expected — BullMQ will retry with backoff
    if (!err.message?.startsWith("DEFER")) {
      logger.error(
        `[worker] referral job failed: ${job?.name} — ${err.message}`,
      );
    }
  });

  logger.info("[workers] BullMQ referral worker started.");
}

export { referralWorker };
