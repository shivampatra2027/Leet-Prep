import { Worker } from "bullmq";
import { connectionCfg, queuesEnabled } from "../queues/index.js";
import { processEvent, POINTS } from "../controllers/referralController.js";
import logger from "../utils/logger.js";

async function handleReferralJob(job) {
  const { name, data } = job;

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

  logger.warn(`[worker] unknown referral job: ${name}`);
}

let referralWorker = null;

export function startWorkers() {
  if (!queuesEnabled) return;

  referralWorker = new Worker("referral", handleReferralJob, {
    connection: connectionCfg,
    concurrency: 5,
    blockingTimeout: 30,
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
