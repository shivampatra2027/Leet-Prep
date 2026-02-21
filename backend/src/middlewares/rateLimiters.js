import rateLimit from "express-rate-limit";
import { getClientKey } from "../utils/getClientKey.js";

function isExemptPath(req) {
  const path = req.originalUrl || req.url || "";
  return (
    path === "/health" ||
    path.startsWith("/auth/google") ||
    path.startsWith("/api/payment/webhook")
  );
}

function isPollingPath(req) {
  const path = req.originalUrl || req.url || "";
  return path.startsWith("/api/payment/status/");
}

function shouldSkipCommon(req) {
  return req.method === "OPTIONS" || isExemptPath(req);
}

function shouldSkipApi(req) {
  return shouldSkipCommon(req) || isPollingPath(req);
}

function limitHandler(req, res) {
  res.status(429).json({
    error: "Too many requests. Slow down a bit.",
  });
}

const commonConfig = {
  keyGenerator: getClientKey,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
};

export const strictLimiter = rateLimit({
  ...commonConfig,
  skip: shouldSkipCommon,
  windowMs: 10 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});

export const apiLimiter = rateLimit({
  ...commonConfig,
  skip: shouldSkipApi,
  windowMs: 60 * 1000,
  max: 120,
});

export const pollingLimiter = rateLimit({
  ...commonConfig,
  skip: shouldSkipCommon,
  windowMs: 60 * 1000,
  max: 300,
});
