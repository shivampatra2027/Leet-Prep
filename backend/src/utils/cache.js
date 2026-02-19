import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL;
const useRedis = process.env.USE_REDIS === "true" || !!redisUrl;

function createRedisClient() {
  if (!useRedis) return null;

  const options = {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
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
}

const redis = createRedisClient();
const memoryCache = new Map();
const isProd = process.env.NODE_ENV === "production";

function keyName(key) {
  return `leetio:cache:${key}`;
}

export const getCache = async (key) => {
  try {
    if (redis) {
      const val = await redis.get(keyName(key));
      if (!val) return null;
      try {
        return JSON.parse(val);
      } catch {
        return null;
      }
    }

    if (isProd) return null;

    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      memoryCache.delete(key);
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
};

export const setCache = async (key, value, ttl = 300) => {
  try {
    if (redis) {
      await redis.set(keyName(key), JSON.stringify(value), "EX", ttl);
      return;
    }

    if (isProd) return;

    memoryCache.set(key, {
      value,
      expires: Date.now() + ttl * 1000,
    });
  } catch {}
};
