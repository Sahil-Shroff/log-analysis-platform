import os from "os";
import crypto from "crypto";
import type { NormalizedLog, LogEntry } from "../log-generators/src/types.ts";

export function validateRawLog(log: LogEntry): boolean {
  return !!log.service && !!log.message;
}

export function enrichLog(log: LogEntry): NormalizedLog {
  return {
    timestamp: log.timestamp,
    service: log.service,
    level: log.level,
    message: log.message,
    traceId: log.trace_id,
    host: os.hostname(),

    // preserve original fields
    latency_ms: log.latency_ms,
    dependency: log.dependency,
    error_code: log.error_code,
    metadata: {}
  };
}

