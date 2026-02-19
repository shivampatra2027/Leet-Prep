import Redis from "ioredis";

let redis = null;

const redisUrl = process.env.REDIS_URL;
const useRedis = process.env.USE_REDIS === "true" || !!redisUrl;

if (useRedis) {
  if (redisUrl) {
    // Upstash / Redis Cloud — URL already contains auth + host + port.
    // ioredis detects "rediss://" and enables TLS automatically.
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });
  } else {
    redis = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });
  }

  redis.on("connect", () => console.log("[redis] Connected"));
  redis.on("error", (err) => console.error("[redis] Error:", err.message));
}

export default redis;
