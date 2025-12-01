import type { LogEntry } from "../types.js";
import { faker } from "@faker-js/faker";

import { publish } from "../../../kafka/producer.js";
import { TOPICS } from "../../../kafka/topics.js";

const levels = ["INFO", "WARN", "ERROR"] as const;

export function generateLog(service: string, dependency?: string): LogEntry {
  const level = levels[Math.floor(Math.random() * levels.length)];
  const timestamp = new Date().toISOString();

  const message =
    level === "ERROR"
      ? faker.hacker.phrase()
      : faker.hacker.ingverb() + " " + faker.hacker.noun();

  const latency_ms = Math.floor(Math.random() * 500);
  const trace_id = faker.string.uuid();
  const hostname = faker.internet.domainWord();
  const error_code =
    level === "ERROR" ? `ERR_${Math.floor(Math.random() * 999)}` : undefined;

  const payload: LogEntry = {
    service,
    level,
    timestamp,
    message,
    latency_ms,
    trace_id,
    hostname,
    dependency,
    error_code,
  };

  publish(TOPICS.RAW_LOGS, payload);

  return payload;
}
