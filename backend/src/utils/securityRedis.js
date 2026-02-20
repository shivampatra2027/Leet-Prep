import IORedis from "ioredis";
import logger from "./logger.js";

let redisClient = null;
let redisInitAttempted = false;

export function getSecurityRedis() {
  if (redisInitAttempted) return redisClient;
  redisInitAttempted = true;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    logger.warn("[security] REDIS_URL missing; security limiters running fail-open.");
    return null;
  }

  try {
    redisClient = new IORedis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
      tls: redisUrl.startsWith("rediss://") ? {} : undefined,
    });

    redisClient.on("error", (err) => {
      logger.error("[security] Redis error:", err.message);
    });
    redisClient.on("connect", () => {
      logger.info("[security] Redis connected for limiters.");
    });
  } catch (err) {
    logger.error("[security] Failed to init Redis:", err.message);
    redisClient = null;
  }

  return redisClient;
}

export function getRequestIp(req) {
  return (
    req.headers["cf-connecting-ip"] ||
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.ip ||
    "unknown"
  );
}

export function nowMs() {
  return Date.now();
}

