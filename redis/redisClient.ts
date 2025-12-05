// redis/redisClient.ts
import { createClient } from "redis";

export const redis = createClient({
  url: "redis://localhost:6379"
});

redis.on("error", (err) => console.error("[redis] Error:", err));

export async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
    console.log("[redis] Connected");
  }
}
