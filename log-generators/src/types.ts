export interface LogEntry {
  service: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
  timestamp: string;
  latency_ms: number;
  trace_id: string;
  dependency?: string;
  error_code?: string;
  hostname: string;
}

export interface RawLog {
  timestamp?: string;
  service: string;
  level: "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL";
  message: string;
  metadata?: Record<string, any>;
}

export interface NormalizedLog {
  timestamp: string;
  service: string;
  level: RawLog["level"];
  message: string;

  traceId: string;
  host: string;

  metadata?: Record<string, any>;
}
