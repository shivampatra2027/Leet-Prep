import Redis from "ioredis";

let redis = null;
const memoryCache = new Map();

if (process.env.USE_REDIS === "true") {
    redis = new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: process.env.REDIS_PORT || 6379,
    });

    redis.on("connect", () => console.log("✅ Redis connected"));
    redis.on("error", (err) => console.error("❌ Redis error:", err));
}

// Get from cache
export const getCache = async (key) => {
    if (redis) {
        const val = await redis.get(key);
        return val ? JSON.parse(val) : null;
    } else {
        const entry = memoryCache.get(key);
        if (!entry) return null;
        const { value, expires } = entry;
        if (Date.now() > expires) {
            memoryCache.delete(key);
            return null;
        }
        return value;
    }
};

// Set in cache
export const setCache = async (key, value, ttl = 300) => {
    if (redis) {
        await redis.set(key, JSON.stringify(value), "EX", ttl);
    } else {
        memoryCache.set(key, { value, expires: Date.now() + ttl * 1000 });
    }
};
