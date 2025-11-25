export interface LogEntry {
  service: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
  timestamp: string;
  latency_ms: number;
  trace_id: string;
  dependency?: string;
  error_code?: string;
}
