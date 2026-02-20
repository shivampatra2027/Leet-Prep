import logger from "../../utils/logger.js";
import {
  addSlidingHit,
  getRequestIp,
  nowMs,
} from "../../utils/securityMemoryStore.js";

const WINDOW_MS = 60 * 1000;
const LIMIT = 10;

export default function paymentVerifyLimiter() {
  return async (req, res, next) => {
    try {
      const orderId = req.body?.razorpay_order_id || req.body?.orderId;
      if (!orderId) {
        return res.status(400).json({
          error: "orderId is required",
          code: "ORDER_ID_REQUIRED",
          retryAfter: 0,
        });
      }

      const key = `payment:verify:${orderId}`;
      const now = nowMs();
      const { count, oldest } = addSlidingHit(key, WINDOW_MS, now);

      if (count > LIMIT) {
        const retryAfter = Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000));
        logger.warn(
          `[security:payment] blocked orderId=${orderId} ip=${getRequestIp(req)} count=${count}`,
        );
        return res.status(429).json({
          error: "Too many payment verification attempts",
          code: "PAYMENT_VERIFY_LIMITED",
          retryAfter,
        });
      }

      return next();
    } catch (err) {
      logger.error("[security:payment] fail-open:", err.message);
      return next();
    }
  };
}
