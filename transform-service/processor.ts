import os from "os";
import crypto from "crypto";
import { NormalizedLog, RawLog } from "../log-generators/src/types";

export function validateRawLog(log: RawLog): boolean {
  if (!log.service || !log.message) return false;
  if (!["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"].includes(log.level)) return false;
  return true;
}

export function enrichLog(log: RawLog): NormalizedLog {
  return {
    timestamp: log.timestamp ?? new Date().toISOString(),
    service: log.service,
    level: log.level,
    message: log.message,

    traceId: crypto.randomUUID(),
    host: os.hostname(),

    metadata: log.metadata ?? {}
  };
}
