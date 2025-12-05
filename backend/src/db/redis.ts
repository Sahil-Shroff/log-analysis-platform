import { Redis } from "ioredis";

export const redis = new Redis({
  host: "localhost",
  port: 6379,
});

redis.on("connect", () => console.log("[redis] connected"));
redis.on("error", (err) => console.error("[redis] error", err));

// --- Key helpers ---

function serviceCountKey(service: string) {
  return `service:${service}:count`;
}

function serviceErrorKey(service: string) {
  return `service:${service}:errors`;
}

function latencySumKey(service: string) {
  return `latency:${service}:sum`;
}

function latencyCountKey(service: string) {
  return `latency:${service}:count`;
}

function latencySamplesKey(service: string) {
  return `latency:${service}:samples`;
}

function logBucketKey(service: string, minuteIso: string) {
  return `logbucket:${service}:${minuteIso}`;
}

function healthKey(service: string) {
  return `service:${service}:health`;
}

function dependencyCountKey(service: string, dep: string) {
  return `dependency:${service}:${dep}:count`;
}

function dependencyErrorKey(service: string, dep: string) {
  return `dependency:${service}:${dep}:errors`;
}

function recentLogsKey(service: string) {
  return `recentlogs:${service}`;
}

// --- Public helper functions ---

export async function getServiceLogCount(service: string): Promise<number> {
  const v = await redis.get(serviceCountKey(service));
  return Number(v) || 0;
}

export async function getServiceErrorCount(service: string): Promise<number> {
  const v = await redis.get(serviceErrorKey(service));
  return Number(v) || 0;
}

export async function getServiceLatencyAvg(service: string): Promise<number> {
  const [sum, count] = await redis.mget(
    latencySumKey(service),
    latencyCountKey(service)
  );
  const s = Number(sum) || 0;
  const c = Number(count) || 0;
  return c === 0 ? 0 : s / c;
}

export async function getServiceLatencyP95(service: string): Promise<number> {
  const size = await redis.zcard(latencySamplesKey(service));
  if (!size) return 0;

  const index = Math.floor(size * 0.95);
  const res = await redis.zrange(latencySamplesKey(service), index, index);
  if (!res.length) return 0;
  return Number(res[0]) || 0;
}

export async function getServiceHealth(service: string): Promise<number> {
  const v = await redis.get(healthKey(service));
  return Number(v) || 0;
}

export async function getServiceRecentLogs(service: string, limit = 50) {
  const raw = await redis.lrange(recentLogsKey(service), 0, limit - 1);
  return raw.map((s) => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

/**
 * Returns a map: { dependencyName: { count, errors } }
 */
export async function getServiceDependencyStats(service: string) {
  // brute-force: scan all keys matching dependency:<service>:*
  const pattern = `dependency:${service}:*`;
  const deps: Record<string, { count: number; errors: number }> = {};

  let cursor = "0";
  do {
    const [next, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
    cursor = next;

    for (const key of keys) {
      const parts = key.split(":"); // ["dependency", service, dep, "count"|"errors"]
      const depName = parts[2];
      const type = parts[3];
      const val = Number(await redis.get(key)) || 0;

      if (!deps[depName]) {
        deps[depName] = { count: 0, errors: 0 };
      }
      if (type === "count") deps[depName].count = val;
      if (type === "errors") deps[depName].errors = val;
    }
  } while (cursor !== "0");

  return deps;
}
