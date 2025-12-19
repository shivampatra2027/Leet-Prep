import Redis from "ioredis";   

const redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
});

export async function setCache(key, value, ttl = 60) {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
}

export async function getCache(key) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
}
