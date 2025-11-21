import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error("REDIS_URL environment variable is required");
    }

    console.log("🔌 Attempting to connect to Redis...");

    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
      connectTimeout: 10000,
      retryStrategy: (times) => {
        if (times > 10) {
          console.error("Redis max retries reached");
          return null;
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
      tls: redisUrl.includes("rediss://")
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
    });

    redis.on("error", (err) => {
      console.error("❌ Redis error:", err.message);
      console.error("Error details:", err);
    });

    redis.on("connect", () => {
      console.log("✅ Connected to Redis");
    });

    redis.on("ready", () => {
      console.log("✅ Redis is ready");
    });

    redis.on("close", () => {
      console.log("⚠️  Redis connection closed");
    });

    redis.on("reconnecting", () => {
      console.log("🔄 Reconnecting to Redis...");
    });
  }

  return redis;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
