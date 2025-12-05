import { redis } from "./redis.ts";

// ------------ System metrics ------------

export async function getSystemTrafficLastMin() {
  return Number(await redis.get("system:logs_last_min")) || 0;
}

export async function getSystemErrorsLastMin() {
  return Number(await redis.get("system:errors_last_min")) || 0;
}

export async function getSystemAvgLatency() {
  return Number(await redis.get("system:avg_latency")) || 0;
}

export async function getSystemP95Latency() {
  return Number(await redis.get("system:p95_latency")) || 0;
}

export async function getTopServicesByTraffic() {
  const entries = await redis.zRangeWithScores("services:traffic", -5, -1);
  return entries.map((x) => ({ service: x.value, logs: x.score }));
}

export async function getTopServicesByErrors() {
  const entries = await redis.zRangeWithScores("services:errors", -5, -1);
  return entries.map((x) => ({ service: x.value, errors: x.score }));
}
