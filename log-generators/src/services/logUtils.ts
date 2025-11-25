import type { LogEntry } from "../types.js";
import { faker } from "@faker-js/faker";

const levels = ["INFO", "WARN", "ERROR"] as const;

export function generateLog(service: string, dependency?: string): LogEntry {
  const level = levels[Math.floor(Math.random() * levels.length)];

  return {
    service,
    level,
    message:
      level === "ERROR"
        ? faker.hacker.phrase()
        : faker.hacker.ingverb() + " " + faker.hacker.noun(),
    timestamp: new Date().toISOString(),
    latency_ms: Math.floor(Math.random() * 500),
    trace_id: faker.string.uuid(),
    dependency,
    error_code: level === "ERROR" ? `ERR_${Math.floor(Math.random() * 999)}` : undefined,
  };
}
