import logger from "../../utils/logger.js";
import {
  addSlidingHit,
  getRequestIp,
  nowMs,
} from "../../utils/securityMemoryStore.js";

const WINDOW_MS = 60 * 1000;
const LIMIT = 300;

function isWebhookPath(req) {
  return req.originalUrl?.startsWith("/api/payment/webhook");
}

export default function floodLimiter() {
  return async (req, res, next) => {
    if (isWebhookPath(req)) return next();

    try {
      const ip = getRequestIp(req);
      const key = `flood:ip:${ip}`;
      const now = nowMs();
      const { count, oldest } = addSlidingHit(key, WINDOW_MS, now);

      if (count > LIMIT) {
        const retryAfter = Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000));
        logger.warn(
          `[security:flood] blocked ip=${ip} count=${count} retryAfter=${retryAfter}s path=${req.originalUrl}`,
        );
        return res.status(429).json({
          error: "Too many requests",
          code: "FLOOD_LIMITED",
          retryAfter,
        });
      }

      return next();
    } catch (err) {
      logger.error("[security:flood] fail-open:", err.message);
      return next();
    }
  };
}
