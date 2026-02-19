import { Worker } from "bullmq";
import { connectionCfg, queuesEnabled } from "../queues/index.js";
import ReferralEvent from "../models/Referral.js";
import User from "../models/User.js";
import { processEvent, POINTS } from "../controllers/referralController.js";
import logger from "../utils/logger.js";

async function ensureNotProcessed(inviterId, inviteeId, type) {
  const event = await ReferralEvent.findOneAndUpdate(
    { inviterId, inviteeId, type, processed: false },
    { processed: true, processedAt: new Date() }
  );
  return !!event;
}

async function handleReferralJob(job) {
  const { name, data } = job;

  if (name === "referral.signup") {
    const { inviterId, inviteeId, inviteeIp, inviterIp } = data;

    const invitee = await User.findById(inviteeId).select("loginCount lastIp");
    if (!invitee || invitee.loginCount < 2) {
      await job.moveToDelayed(Date.now() + 5 * 60 * 1000);
      return;
    }

    const effectiveInviteeIp = invitee.lastIp || inviteeIp;
    if (effectiveInviteeIp && inviterIp && effectiveInviteeIp === inviterIp) {
      await ReferralEvent.findOneAndUpdate(
        { inviterId, inviteeId, type: "signup" },
        {
          rejected: true,
          rejectionReason: "same_ip",
          processed: true,
          processedAt: new Date(),
        }
      );
      return;
    }

    const allowed = await ensureNotProcessed(inviterId, inviteeId, "signup");
    if (!allowed) return;

    await processEvent({
      inviterId,
      inviteeId,
      type: "signup",
      points: POINTS.signup,
    });
    return;
  }

  if (name === "referral.active") {
    const { inviterId, inviteeId } = data;

    const allowed = await ensureNotProcessed(inviterId, inviteeId, "active_next_day");
    if (!allowed) return;

    await processEvent({
      inviterId,
      inviteeId,
      type: "active_next_day",
      points: POINTS.active_next_day,
    });
    return;
  }

  if (name === "referral.purchase") {
    const { inviterId, inviteeId } = data;

    const allowed = await ensureNotProcessed(inviterId, inviteeId, "purchase");
    if (!allowed) return;

    await processEvent({
      inviterId,
      inviteeId,
      type: "purchase",
      points: POINTS.purchase,
    });
    return;
  }
}

let referralWorker = null;

export function startWorkers() {
  if (!queuesEnabled) return;

  referralWorker = new Worker("referral", handleReferralJob, {
    connection: connectionCfg,
    concurrency: 5,
    lockDuration: 120000,
    stalledInterval: 120000,
  });

  referralWorker.on("completed", job =>
    logger.info(`[worker] referral job done: ${job.name} (${job.id})`)
  );

  referralWorker.on("failed", (job, err) => {
    logger.error(`[worker] referral job failed: ${job?.name} — ${err.message}`);
  });

  logger.info("[workers] BullMQ referral worker started.");
}

export { referralWorker };
