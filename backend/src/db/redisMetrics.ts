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

