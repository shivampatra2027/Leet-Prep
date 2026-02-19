import { connectionCfg } from "../queues/index.js";

const redis = connectionCfg;
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
