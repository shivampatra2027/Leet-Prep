import Redis from "ioredis";

let redis = null;

if (process.env.USE_REDIS === "true") {
    redis = new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: process.env.REDIS_PORT || 6379,
    });

    redis.on("connect", () => console.log("✅ Redis connected"));
    redis.on("error", (err) => console.error("❌ Redis error:", err));
}

export default redis;
