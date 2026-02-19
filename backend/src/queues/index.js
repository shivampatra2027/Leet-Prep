/**
 * BullMQ queue definitions.
 *
 * Queues are only created when Redis is available (REDIS_URL set or USE_REDIS=true).
 * If Redis is absent the exports are null and queue-driven features should fail fast.
 */
import { Queue } from "bullmq";
import IORedis from "ioredis";
import logger from "../utils/logger.js";

// ── Create the shared ioredis connection BullMQ and Workers will use ─────────
function buildConnection() {
  const redisUrl = process.env.REDIS_URL;
  const useRedis = process.env.USE_REDIS === "true" || !!redisUrl;
  if (!useRedis) return null;

  try {
    if (redisUrl) {
      // Upstash / Redis Cloud — "rediss://" prefix triggers TLS automatically.
      return new IORedis(redisUrl, {
        maxRetriesPerRequest: null, // required by BullMQ
        enableReadyCheck: false,
        lazyConnect: true,
      });
    }

    return new IORedis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });
  } catch (err) {
    logger.error(`[queues] Failed to create Redis connection: ${err.message}`);
    return null;
  }
}

const connectionConfig = buildConnection();

const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: "exponential", delay: 5_000 },
  removeOnComplete: { count: 500 },
  removeOnFail: { count: 200 },
};
connectionConfig?.on("error", err => {
  logger.error("[Redis] connection error:", err.message);
});

connectionConfig?.on("connect", () => {
  logger.info("[Redis] connected");
});

function makeQueue(name) {
  if (!connectionConfig) return null;
  try {
    return new Queue(name, {
      connection: connectionConfig,
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });
  } catch (err) {
    logger.warn(`[queues] Failed to create queue "${name}": ${err.message}`);
    return null;
  }
}

export const referralQueue = makeQueue("referral");
// premiumQueue removed — premium expiry is handled inline by authMiddleware (zero Redis ops)
export const connectionCfg = connectionConfig; // re-exported for workers
export const queuesEnabled = !!connectionConfig;

if (queuesEnabled) {
  logger.info("[queues] BullMQ queues initialised (Redis enabled).");
} else {
  logger.warn("[queues] Redis not configured; referral queue is disabled.");
}
