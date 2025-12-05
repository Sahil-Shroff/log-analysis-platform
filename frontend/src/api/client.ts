import axios from "axios";
import type {
  DashboardSummary,
  GlobalOlapResponse,
  LogSearchResult,
  ServiceMetrics,
  ServiceOlapResponse,
  ServiceOverviewItem,
  ServiceRecentLogsResponse
} from "./types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  timeout: 15000
});

export function getDashboardSummary() {
  return api.get<DashboardSummary>("/dashboard/summary").then((r) => r.data);
}

export function getServicesOverview() {
  return api.get<ServiceOverviewItem[]>("/services").then((r) => r.data);
}

export function getServiceMetrics(service: string) {
  return api
    .get<ServiceMetrics>(`/services/${service}/metrics`)
    .then((r) => r.data);
}

export function getServiceRecentLogs(service: string) {
  return api
    .get<ServiceRecentLogsResponse>(`/services/${service}/recent-logs`)
    .then((r) => r.data);
}

export function getServiceOlap(service: string, hours = 24) {
  return api
    .get<ServiceOlapResponse>(`/services/${service}/olap`, { params: { hours } })
    .then((r) => r.data);
}

export function searchLogs(params: Record<string, string | number | undefined>) {
  return api.get<LogSearchResult>("/logs/search", { params }).then((r) => r.data);
}

export function getGlobalOlap(hours = 24) {
  return api
    .get<GlobalOlapResponse>("/olap/metrics", { params: { hours } })
    .then((r) => r.data);
}
