import logger from "./logger.js";

export function attachRedisOpsLogger(redis, options = {}) {
  if (!redis || redis.__opsLoggerAttached) return;

  const intervalMs = options.intervalMs || 60_000;
  const label = options.label || "redis";
  let opsCount = 0;

  const originalSendCommand = redis.sendCommand.bind(redis);
  redis.sendCommand = (...args) => {
    opsCount += 1;
    return originalSendCommand(...args);
  };

  const timer = setInterval(() => {
    logger.info(`[${label}] ops last minute: ${opsCount}`);
    opsCount = 0;
  }, intervalMs);

  if (typeof timer.unref === "function") {
    timer.unref();
  }

  redis.__opsLoggerAttached = true;
}
