import logger from "./logger.js";

const records = new Map();
const MAX_KEYS = 20000;
let opCount = 0;

function maybeCleanup(now) {
  opCount += 1;
  if (opCount % 250 !== 0) return;

  for (const [key, rec] of records) {
    if (rec.expiresAt <= now && rec.blockUntil <= now && rec.hits.length === 0) {
      records.delete(key);
    }
  }

  if (records.size <= MAX_KEYS) return;

  const overflow = records.size - MAX_KEYS;
  let removed = 0;
  for (const key of records.keys()) {
    records.delete(key);
    removed += 1;
    if (removed >= overflow) break;
  }

  logger.warn(`[security:memory] key cap reached; pruned=${removed} size=${records.size}`);
}

function getRecord(key) {
  if (!records.has(key)) {
    records.set(key, { hits: [], blockUntil: 0, expiresAt: 0 });
  }
  return records.get(key);
}

function pruneHits(rec, windowStart) {
  while (rec.hits.length > 0 && rec.hits[0] <= windowStart) {
    rec.hits.shift();
  }
}

export function nowMs() {
  return Date.now();
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

export function countSlidingHits(key, windowMs, now = nowMs()) {
  const rec = getRecord(key);
  const windowStart = now - windowMs;
  pruneHits(rec, windowStart);
  rec.expiresAt = Math.max(rec.expiresAt, now + windowMs + 5000);
  maybeCleanup(now);
  return {
    count: rec.hits.length,
    oldest: rec.hits[0] ?? now,
  };
}

export function addSlidingHit(key, windowMs, now = nowMs()) {
  const rec = getRecord(key);
  const windowStart = now - windowMs;
  pruneHits(rec, windowStart);
  rec.hits.push(now);
  rec.expiresAt = Math.max(rec.expiresAt, now + windowMs + 5000);
  maybeCleanup(now);
  return {
    count: rec.hits.length,
    oldest: rec.hits[0] ?? now,
  };
}

export function setTempBlock(key, blockMs, now = nowMs()) {
  const rec = getRecord(key);
  const until = now + blockMs;
  rec.blockUntil = Math.max(rec.blockUntil, until);
  rec.expiresAt = Math.max(rec.expiresAt, rec.blockUntil + 5000);
  maybeCleanup(now);
}

export function getBlockTtlMs(key, now = nowMs()) {
  const rec = records.get(key);
  if (!rec) return 0;
  const ttl = rec.blockUntil - now;
  if (ttl <= 0) {
    rec.blockUntil = 0;
    if (rec.hits.length === 0 && rec.expiresAt <= now) {
      records.delete(key);
    }
    return 0;
  }
  return ttl;
}

export function clearSecurityKeys(...keys) {
  for (const key of keys) {
    records.delete(key);
  }
}
