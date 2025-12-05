import { redis } from "./redis.ts";

// ------------ System metrics ------------

async function getRollingCount(zsetKey: string, windowMs = 60_000) {
  const now = Date.now();
  // drop out-of-window entries then return current size
  await redis.zremrangebyscore(zsetKey, 0, now - windowMs);
  const count = await redis.zcard(zsetKey);
  return count;
}

export async function getSystemTrafficLastMin() {
  // primary source is the rolling zset; fallback to legacy scalar if present
  const count = await getRollingCount("system:logs_last_min:zset");
  if (count) return count;
  return Number(await redis.get("system:logs_last_min")) || 0;
}

export async function getSystemErrorsLastMin() {
  const count = await getRollingCount("system:errors_last_min:zset");
  if (count) return count;
  return Number(await redis.get("system:errors_last_min")) || 0;
}

export async function getSystemAvgLatency() {
  return Number(await redis.get("system:avg_latency")) || 0;
}

export async function getSystemP95Latency() {
  return Number(await redis.get("system:p95_latency")) || 0;
}

export async function getTopServicesByTraffic() {
  const raw = await redis.zrevrange("services:traffic", 0, 4, "WITHSCORES");

  const list = [];
  for (let i = 0; i < raw.length; i += 2) {
    list.push({
      service: raw[i],
      logs: Number(raw[i + 1]),
    });
  }

  return list;
}

export async function getTopServicesByErrors() {
  const raw = await redis.zrevrange("services:errors", 0, 4, "WITHSCORES");

  const list = [];
  for (let i = 0; i < raw.length; i += 2) {
    list.push({
      service: raw[i],
      errors: Number(raw[i + 1]),
    });
  }

  return list;
}

