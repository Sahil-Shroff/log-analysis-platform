// redis-aggregator/index.ts
import { createConsumer } from "../kafka/consumer.ts";
import { TOPICS } from "../kafka/topics.ts";
import { connectRedis, redis } from "../redis/redisClient.ts";

export async function startRedisAggregator() {
  await connectRedis();

  await createConsumer("redis-aggregator", TOPICS.CLEAN_LOGS, async (log) => {
    console.log("[redis-aggregator] incoming log:", log);

    // A. Logs per service
    await redis.incr(`service:${log.service}:count`);

    // B. Error count per service
    if (log.level === "ERROR" || log.level === "CRITICAL") {
      await redis.incr(`service:${log.service}:errors`);
    }

    // PHASE 2: Latency + per-minute buckets

    // C. Latency metrics
    await redis.incrBy(`latency:${log.service}:sum`, log.latency_ms);
    await redis.incr(`latency:${log.service}:count`);

    await redis.zAdd(`latency:${log.service}:samples`, {
      score: log.latency_ms,
      value: `${Date.now()}`
    });

    // keep last 1000 latency samples
    await redis.zRemRangeByRank(`latency:${log.service}:samples`, 0, -1001);


    // D. Logs per minute (sliding window)
    const minute = new Date().toISOString().slice(0, 16); 
    const bucketKey = `logbucket:${log.service}:${minute}`;

    await redis.incr(bucketKey);
    await redis.expire(bucketKey, 60 * 120); // keep buckets for 2 hours

    // ---------------------------
    // PHASE 3: Service health score
    // ---------------------------

    // E. Service health score
    // baseline health
    const baseHealth = 100;

    let health = baseHealth;

    // impact of errors
    if (log.level === "ERROR") health -= 2;
    if (log.level === "CRITICAL") health -= 5;

    // impact of high latency
    if (log.latency_ms > 300) {
      health -= Math.floor((log.latency_ms - 300) / 50);
    }

    // clamp between 0 and 100
    health = Math.max(0, Math.min(100, health));

    // write to Redis
    await redis.set(`service:${log.service}:health`, health);

    // F. Dependency metrics
    if (log.dependency) {
      await redis.incr(`dependency:${log.service}:${log.dependency}:count`);
      if (log.level === "ERROR" || log.level === "CRITICAL") {
        await redis.incr(`dependency:${log.service}:${log.dependency}:errors`);
      }
    }

    // G. Recent logs (last 50)
    await redis.lPush(
      `recentlogs:${log.service}`,
      JSON.stringify(log)
    );

    // keep only last 50 logs
    await redis.lTrim(`recentlogs:${log.service}`, 0, 49);

  });

  console.log("[redis-aggregator] Running");
}

startRedisAggregator().catch(console.error);
