import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { getDashboardSummary, getGlobalOlap } from "../api/client";
import { usePolling } from "../hooks/usePolling";
import { MetricCard } from "../components/MetricCard";
import { ChartPanel } from "../components/ChartPanel";
import { PageHeader } from "../components/PageHeader";
import { Loading } from "../components/Loading";
import { ErrorState } from "../components/ErrorState";
import type { DashboardSummary, GlobalOlapResponse } from "../api/types";

function formatLabel(ts: string) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:00`;
}

export default function DashboardPage() {
  const {
    data: summary,
    error: summaryError,
    loading: summaryLoading
  } = usePolling<DashboardSummary>(getDashboardSummary, {
    intervalMs: 5000,
    immediate: true
  });

  const {
    data: olap,
    error: olapError,
    loading: olapLoading
  } = usePolling<GlobalOlapResponse>(() => getGlobalOlap(24), {
    intervalMs: 60000,
    immediate: true
  });

  const totals = useMemo(() => {
    if (!olap) return { logs: 0, errors: 0 };
    return {
      logs: olap.data.reduce((acc, cur) => acc + cur.logs, 0),
      errors: olap.data.reduce((acc, cur) => acc + cur.errors, 0)
    };
  }, [olap]);

  const trafficSeries =
    olap?.data.map((d) => ({
      time: formatLabel(d.timestamp),
      logs: d.logs,
      errors: d.errors
    })) || [];

  const latencySeries =
    olap?.data.map((d) => ({
      time: formatLabel(d.timestamp),
      avg: d.avg_latency,
      p95: d.p95_latency
    })) || [];

  return (
    <div className="page">
      <PageHeader
        title="Real-Time Overview"
        subtitle="Redis-backed live stats with hourly OLAP context"
      />

      {summaryError ? <ErrorState message="Failed to load dashboard summary" /> : null}
      {olapError ? <ErrorState message="Failed to load OLAP metrics" /> : null}

      <div className="grid grid-4">
        <MetricCard
          title="Logs / min"
          value={summary?.total_logs_last_min ?? (summaryLoading ? "..." : 0)}
          hint="Last 60 seconds from Redis"
        />
        <MetricCard
          title="Errors / min"
          value={summary?.errors_last_min ?? (summaryLoading ? "..." : 0)}
          hint="Last 60 seconds from Redis"
          tone="danger"
        />
        <MetricCard
          title="Avg Latency"
          value={
            summary ? `${summary.avg_latency.toFixed(1)} ms` : summaryLoading ? "..." : "0 ms"
          }
          hint="Mean from Redis window"
        />
        <MetricCard
          title="p95 Latency"
          value={
            summary ? `${summary.p95_latency.toFixed(1)} ms` : summaryLoading ? "..." : "0 ms"
          }
          hint="P95 from Redis window"
        />
      </div>

      <div className="grid grid-3">
        <MetricCard title="Logs (24h)" value={totals.logs} hint="Postgres aggregated hourly" />
        <MetricCard
          title="Errors (24h)"
          value={totals.errors}
          hint="Postgres aggregated hourly"
          tone="danger"
        />
        <MetricCard
          title="Health Score"
          value={summary ? `${summary.system_health_score}%` : "..."}
          hint="Derived metric"
          tone="success"
        />
      </div>

      <div className="grid grid-2">
        <ChartPanel
          title="Traffic & Errors (hourly)"
          action={olapLoading ? <Loading text="Refreshing..." /> : null}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trafficSeries}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="logs" fill="#7f9cf5" name="Logs" />
              <Bar dataKey="errors" fill="#f56565" name="Errors" />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Latency trend" action={olapLoading ? <Loading text="Refreshing..." /> : null}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={latencySeries}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avg" stroke="#2dd4bf" name="Avg" />
              <Line type="monotone" dataKey="p95" stroke="#f59e0b" name="p95" />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <div className="grid grid-2">
        <ChartPanel title="Top services by traffic" action={summaryLoading ? <Loading /> : null}>
          {summaryLoading && <Loading />}
          {summary && summary.top_services_by_traffic.length === 0 && (
            <div className="muted">No traffic data yet</div>
          )}
          {summary && summary.top_services_by_traffic.length > 0 && (
            <ul className="list">
              {summary.top_services_by_traffic.map((item) => (
                <li key={item.service}>
                  <span>{item.service}</span>
                  <span className="muted">{item.logs} logs</span>
                </li>
              ))}
            </ul>
          )}
        </ChartPanel>

        <ChartPanel title="Top services by errors" action={summaryLoading ? <Loading /> : null}>
          {summaryLoading && <Loading />}
          {summary && summary.top_services_by_errors.length === 0 && (
            <div className="muted">No errors recorded</div>
          )}
          {summary && summary.top_services_by_errors.length > 0 && (
            <ul className="list">
              {summary.top_services_by_errors.map((item) => (
                <li key={item.service}>
                  <span>{item.service}</span>
                  <span className="muted">{item.errors} errors</span>
                </li>
              ))}
            </ul>
          )}
        </ChartPanel>
      </div>
    </div>
  );
}
