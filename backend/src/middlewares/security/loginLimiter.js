import logger from "../../utils/logger.js";
import {
  addSlidingHit,
  clearSecurityKeys,
  countSlidingHits,
  getBlockTtlMs,
  nowMs,
  setTempBlock,
} from "../../utils/securityMemoryStore.js";

const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;

const DELAY_THRESHOLD = 5;
const CAPTCHA_THRESHOLD = 10;
const BLOCK_THRESHOLD = 20;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function getKeys(email) {
  return {
    fails: `login:fail:${email}`,
    block: `login:block:${email}`,
  };
}

export async function preLoginCheck(req, res, next) {
  const email = normalizeEmail(req.body?.email);
  if (!email) return next();

  try {
    const { fails, block } = getKeys(email);
    const blockTtl = getBlockTtlMs(block);
    if (blockTtl > 0) {
      const retryAfter = Math.max(1, Math.ceil(blockTtl / 1000));
      logger.warn(
        `[security:login] blocked email=${email} retryAfter=${retryAfter}s`,
      );
      return res.status(429).json({
        error: "Too many failed login attempts",
        code: "LOGIN_TEMP_BLOCKED",
        retryAfter,
      });
    }

    const { count: failCount } = countSlidingHits(fails, WINDOW_MS, nowMs());

    if (failCount >= CAPTCHA_THRESHOLD && !req.body?.captchaToken) {
      logger.warn(`[security:login] captcha required email=${email} failCount=${failCount}`);
      return res.status(403).json({
        error: "Captcha required",
        code: "CAPTCHA_REQUIRED",
        captchaRequired: true,
        retryAfter: 0,
      });
    }

    if (failCount >= DELAY_THRESHOLD) {
      await sleep(1000);
    }

    req.loginRisk = { email, failCount };
    return next();
  } catch (err) {
    logger.error("[security:login] pre-check fail-open:", err.message);
    req.loginRisk = { email, failCount: 0 };
    return next();
  }
}

export async function recordLoginFailure(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return;

  try {
    const { fails, block } = getKeys(normalized);
    const now = nowMs();
    const { count: failCount } = addSlidingHit(fails, WINDOW_MS, now);

    if (failCount >= BLOCK_THRESHOLD) {
      setTempBlock(block, BLOCK_MS, now);
      logger.warn(`[security:login] hard block email=${normalized} failCount=${failCount}`);
      return;
    }

    if (failCount >= CAPTCHA_THRESHOLD) {
      logger.warn(`[security:login] escalation captcha email=${normalized} failCount=${failCount}`);
    }
  } catch (err) {
    logger.error("[security:login] record failure error:", err.message);
  }
}

export async function clearLoginFailures(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return;

  try {
    const { fails, block } = getKeys(normalized);
    clearSecurityKeys(fails, block);
  } catch (err) {
    logger.error("[security:login] clear failures error:", err.message);
  }
}
