/**
 * BullMQ queue definitions (Production Safe)
 */

import { Queue } from "bullmq";
import IORedis from "ioredis";
import logger from "../utils/logger.js";

let keepAliveStarted = false;

// ── Create Redis connection ──────────────────────────────────────────────
function buildConnection() {
  const redisUrl = process.env.REDIS_URL;
  const useRedis = process.env.USE_REDIS === "true" || !!redisUrl;
  if (!useRedis) return null;

  try {
    const options = {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      tls: redisUrl?.startsWith("rediss://") ? {} : undefined,
    };

    if (redisUrl) {
      return new IORedis(redisUrl, options);
    }

    return new IORedis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      ...options,
    });
  } catch (err) {
    logger.error(`[queues] Failed to create Redis connection: ${err.message}`);
    return null;
  }
}

const connectionConfig = buildConnection();

// 🚨 Fail fast in production
if (!connectionConfig && process.env.NODE_ENV === "production") {
  throw new Error("Redis is required in production but not available");
}

// ── Logging ──────────────────────────────────────────────────────────────
connectionConfig?.on("error", err => {
  logger.error("[Redis] connection error:", err.message);
});

connectionConfig?.on("connect", () => {
  logger.info("[Redis] connected");
});

connectionConfig?.on("ready", () => {
  if (!keepAliveStarted) {
    keepAliveStarted = true;
    setInterval(() => connectionConfig.ping().catch(() => {}), 30000);
    logger.info("[Redis] keepalive started");
  }
});

// ── Queue config ─────────────────────────────────────────────────────────
const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: "exponential", delay: 5000 },
  removeOnComplete: true,
  removeOnFail: 50,
};

function makeQueue(name) {
  if (!connectionConfig) return null;
  return new Queue(name, {
    connection: connectionConfig,
    prefix: "leetio",
    defaultJobOptions: DEFAULT_JOB_OPTIONS,
  });
}

// ── Export queues ────────────────────────────────────────────────────────
export const referralQueue = makeQueue("referral");
export const connectionCfg = connectionConfig;
export const queuesEnabled = !!connectionConfig;

if (queuesEnabled) {
  logger.info("[queues] BullMQ queues initialised (Redis enabled).");
} else {
  logger.warn("[queues] Redis not configured; referral queue disabled.");
}
