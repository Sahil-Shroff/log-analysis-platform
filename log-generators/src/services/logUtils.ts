import type { LogEntry } from "../types.js";
import { faker } from "@faker-js/faker";

import { sendLog } from "../../../kafka/producer.ts";

const levels = ["INFO", "WARN", "ERROR"] as const;

export function generateLog(service: string, dependency?: string): LogEntry {
  const level = levels[Math.floor(Math.random() * levels.length)];
  const timestamp = new Date().toISOString();
  const message = level === "ERROR"
        ? faker.hacker.phrase()
        : faker.hacker.ingverb() + " " + faker.hacker.noun()
  const latency_ms = Math.floor(Math.random() * 500);
  const trace_id = faker.string.uuid();
  const error_code = level === "ERROR" ? `ERR_${Math.floor(Math.random() * 999)}` : undefined;
  
  sendLog({
    service,
    level,
    timestamp,
    message,
    latency_ms,
    trace_id,
    dependency,
    error_code,
  });

  return {
    service,
    level,
    message,
    timestamp,
    latency_ms,
    trace_id,
    dependency,
    error_code,
  };
}
