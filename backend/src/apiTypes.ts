// Dashboard

export interface DashboardSummary {
  total_logs_last_min: number;
  errors_last_min: number;
  avg_latency: number;
  p95_latency: number;
  top_services_by_traffic: { service: string; logs: number }[];
  top_services_by_errors: { service: string; errors: number }[];
  system_health_score: number;
}

// Services overview

export interface ServiceOverviewItem {
  service: string;
  logs_per_min: number;
  errors_per_min: number;
  avg_latency: number;
  p95_latency: number;
  health_score: number;
}

// Service details (metrics)

export interface ServiceMetrics {
  service: string;
  logs_last_min: number;
  errors_last_min: number;
  avg_latency: number;
  p95_latency: number;
  health_score: number;
  dependency_errors: Record<string, { count: number; errors: number }>;
}

// Recent logs

export interface ServiceRecentLogsResponse {
  service: string;
  logs: Array<{
    timestamp: string;
    level: string;
    message: string;
    latency_ms?: number;
    trace_id?: string;
    hostname?: string;
    dependency?: string;
    error_code?: string;
  }>;
}

// Service OLAP

export interface ServiceOlapResponse {
  service: string;
  points: Array<{
    timestamp: string;
    total_logs: number;
    error_count: number;
    error_rate: number;
    avg_latency: number | null;
    p95_latency: number | null;
  }>;
}

// Log search

export interface LogSearchResult {
  total: number;
  results: Array<{
    id: number;
    timestamp: string;
    service: string;
    level: string;
    message: string;
    trace_id?: string;
    hostname?: string;
    dependency?: string;
    latency_ms?: number;
    error_code?: string;
  }>;
}

// Global OLAP

export interface GlobalOlapResponse {
  hours: number;
  data: Array<{
    timestamp: string;
    logs: number;
    errors: number;
    avg_latency: number | null;
    p95_latency: number | null;
  }>;
}
