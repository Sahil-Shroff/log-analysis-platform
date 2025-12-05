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

  });

  console.log("[redis-aggregator] Running");
}

startRedisAggregator().catch(console.error);
