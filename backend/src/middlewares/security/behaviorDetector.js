import logger from "../../utils/logger.js";
import {
  addSlidingHit,
  getBlockTtlMs,
  getRequestIp,
  nowMs,
  setTempBlock,
} from "../../utils/securityMemoryStore.js";

const BURST_WINDOW_MS = 2000;
const BURST_LIMIT = 20;
const BLOCK_MS = 5 * 60 * 1000;

function isWebhookPath(req) {
  return req.originalUrl?.startsWith("/api/payment/webhook");
}

export default function behaviorDetector() {
  return async (req, res, next) => {
    if (isWebhookPath(req)) return next();

    try {
      const ip = getRequestIp(req);
      const blockKey = `burst:block:${ip}`;
      const blockedTtl = getBlockTtlMs(blockKey);
      if (blockedTtl > 0) {
        const retryAfter = Math.max(1, Math.ceil(blockedTtl / 1000));
        logger.warn(
          `[security:burst] blocked ip=${ip} retryAfter=${retryAfter}s path=${req.originalUrl}`,
        );
        return res.status(429).json({
          error: "Temporary traffic block",
          code: "BURST_BLOCKED",
          retryAfter,
        });
      }

      const now = nowMs();
      const key = `burst:ip:${ip}`;
      const { count } = addSlidingHit(key, BURST_WINDOW_MS, now);

      if (count > BURST_LIMIT) {
        setTempBlock(blockKey, BLOCK_MS, now);
        const retryAfter = Math.ceil(BLOCK_MS / 1000);
        logger.warn(
          `[security:burst] triggered ip=${ip} count=${count} retryAfter=${retryAfter}s`,
        );
        return res.status(429).json({
          error: "Too many rapid requests",
          code: "BURST_DETECTED",
          retryAfter,
        });
      }

      return next();
    } catch (err) {
      logger.error("[security:burst] fail-open:", err.message);
      return next();
    }
  };
}
