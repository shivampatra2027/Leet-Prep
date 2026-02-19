import "dotenv/config";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.error("REDIS_URL is required to monitor Redis commands.");
  process.exit(1);
}

const redis = new IORedis(redisUrl, {
  tls: redisUrl.startsWith("rediss://") ? {} : undefined,
});

async function monitorRedis() {
  try {
    const monitor = await redis.monitor();
    console.log("Monitoring Redis commands...\n");

    monitor.on("monitor", (time, args) => {
      console.log(time, args.join(" "));
    });

    monitor.on("error", (err) => {
      console.error("Redis monitor error:", err.message);
    });

    const shutdown = async () => {
      try {
        monitor.disconnect();
      } catch {}
      try {
        await redis.quit();
      } catch {
        redis.disconnect();
      }
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    console.error("Failed to start Redis monitor:", err.message);
    process.exit(1);
  }
}

monitorRedis();

// for redis monitoring
// npm run redis:monitor
