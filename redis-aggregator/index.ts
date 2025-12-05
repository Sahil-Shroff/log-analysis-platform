// redis-aggregator/index.ts
import { createConsumer } from "../kafka/consumer.ts";
import { TOPICS } from "../kafka/topics.ts";
import { connectRedis, redis } from "../redis/redisClient.ts";

export async function startRedisAggregator() {
  await connectRedis();

  await createConsumer("redis-aggregator", TOPICS.CLEAN_LOGS, async (log) => {
    console.log("[redis-aggregator] incoming log:", log);
    const now = Date.now();
    const isError = log.level === "ERROR" || log.level === "CRITICAL";

    // Register service
    await redis.sAdd("services:list", log.service);

    // A. Logs per service
    await redis.incr(`service:${log.service}:count`);

    // B. Error count per service
    if (isError) {
      await redis.incr(`service:${log.service}:errors`);
    }

    // Leaderboards
    await redis.zIncrBy("services:traffic", 1, log.service);
    if (isError) {
      await redis.zIncrBy("services:errors", 1, log.service);
    }

    // System-wide traffic/error counts (rolling 60s)
    const logWindowMs = 60 * 1000;
    const logsWindow = redis.multi();
    logsWindow.zAdd("system:logs_last_min:zset", { score: now, value: `${now}:${log.service}` });
    logsWindow.zRemRangeByScore("system:logs_last_min:zset", 0, now - logWindowMs);
    logsWindow.zCard("system:logs_last_min:zset");
    const logWindowResults = await logsWindow.exec();
    const logsLastMin = Number(logWindowResults?.[2] ?? 0) || 0;
    await redis.set("system:logs_last_min", logsLastMin);

    const errorWindow = redis.multi();
    if (isError) {
      errorWindow.zAdd("system:errors_last_min:zset", { score: now, value: `${now}:${log.service}:${log.level}` });
    }
    errorWindow.zRemRangeByScore("system:errors_last_min:zset", 0, now - logWindowMs);
    errorWindow.zCard("system:errors_last_min:zset");
    const errorWindowResults = await errorWindow.exec();
    const errorsLastMin = Number(errorWindowResults?.[errorWindowResults.length - 1] ?? 0) || 0;
    await redis.set("system:errors_last_min", errorsLastMin);

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

    // System latency metrics
    const systemLatencyPipeline = redis.multi();
    systemLatencyPipeline.incrBy("system:latency_sum", log.latency_ms);
    systemLatencyPipeline.incr("system:latency_count");
    systemLatencyPipeline.zAdd("system:latency_samples", { score: log.latency_ms, value: `${now}:${log.service}` });
    systemLatencyPipeline.zRemRangeByRank("system:latency_samples", 0, -1001);
    systemLatencyPipeline.zCard("system:latency_samples");
    const latencyResults = await systemLatencyPipeline.exec();
    const systemLatencySum = Number(latencyResults?.[0] ?? 0);
    const systemLatencyCount = Number(latencyResults?.[1] ?? 0);
    const systemSampleSize = Number(latencyResults?.[4] ?? 0);

    const avgLatency = systemLatencyCount > 0 ? systemLatencySum / systemLatencyCount : 0;
    await redis.set("system:avg_latency", avgLatency);

    if (systemSampleSize > 0) {
      const p95Index = Math.floor(systemSampleSize * 0.95);
      const [p95Entry] = await redis.zRangeWithScores("system:latency_samples", p95Index, p95Index);
      const p95Latency = Number(p95Entry?.score ?? 0);
      await redis.set("system:p95_latency", p95Latency);
    } else {
      await redis.set("system:p95_latency", 0);
    }


    // D. Logs per minute (sliding window)
    const minute = new Date(now).toISOString().slice(0, 16);
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
