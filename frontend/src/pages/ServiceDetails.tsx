import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  getServiceMetrics,
  getServiceOlap,
  getServiceRecentLogs
} from "../api/client";
import { usePolling } from "../hooks/usePolling";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { Loading } from "../components/Loading";
import { ErrorState } from "../components/ErrorState";
import type { ServiceMetrics, ServiceOlapResponse, ServiceRecentLogsResponse } from "../api/types";

type Tab = "metrics" | "logs" | "olap";

function formatTs(ts: string) {
  return new Date(ts).toLocaleTimeString();
}

export default function ServiceDetailsPage() {
  const { service = "" } = useParams();
  const [tab, setTab] = useState<Tab>("metrics");
  const [hours, setHours] = useState(24);
  const [olap, setOlap] = useState<ServiceOlapResponse | null>(null);
  const [olapLoading, setOlapLoading] = useState(false);
  const [olapError, setOlapError] = useState<unknown>(null);

  const {
    data: metrics,
    loading: metricsLoading,
    error: metricsError
  } = usePolling<ServiceMetrics>(() => getServiceMetrics(service), {
    intervalMs: 4000,
    immediate: true,
    deps: [service]
  });

  const {
    data: logs,
    loading: logsLoading,
    error: logsError
  } = usePolling<ServiceRecentLogsResponse>(() => getServiceRecentLogs(service), {
    intervalMs: 3000,
    immediate: true,
    deps: [service]
  });

  useEffect(() => {
    const run = async () => {
      setOlapLoading(true);
      try {
        const res = await getServiceOlap(service, hours);
        setOlap(res);
        setOlapError(null);
      } catch (err) {
        setOlapError(err);
      } finally {
        setOlapLoading(false);
      }
    };
    run();
  }, [service, hours]);

  const dependencyRows = useMemo(
    () =>
      metrics
        ? Object.entries(metrics.dependency_errors).map(([dep, val]) => ({
            dep,
            ...val
          }))
        : [],
    [metrics]
  );

  const olapSeries =
    olap?.points.map((p) => ({
      time: new Date(p.timestamp).toLocaleString(undefined, { hour: "2-digit", day: "numeric", month: "short" }),
      logs: p.total_logs,
      errors: p.error_count,
      error_rate: p.error_rate,
      avg: p.avg_latency,
      p95: p.p95_latency
    })) || [];

  return (
    <div className="page">
      <PageHeader
        title={`Service: ${service}`}
        subtitle="Real-time Redis metrics, recent logs, and OLAP trends"
      />

      <div className="tabs">
        {(["metrics", "logs", "olap"] as Tab[]).map((key) => (
          <button
            key={key}
            className={tab === key ? "tab active" : "tab"}
            onClick={() => setTab(key)}
          >
            {key === "metrics" && "Real-Time Metrics"}
            {key === "logs" && "Recent Logs"}
            {key === "olap" && "Historical Trends"}
          </button>
        ))}
      </div>

      {tab === "metrics" && (
        <>
          {metricsError ? <ErrorState message="Failed to load metrics" /> : null}
          <div className="grid grid-3">
            <MetricCard
              title="Logs / min"
              value={metrics ? metrics.logs_last_min : metricsLoading ? "…" : 0}
            />
            <MetricCard
              title="Errors / min"
              value={metrics ? metrics.errors_last_min : metricsLoading ? "…" : 0}
              tone="danger"
            />
            <MetricCard
              title="Health Score"
              value={metrics ? `${metrics.health_score}%` : "—"}
              tone="success"
            />
          </div>
          <div className="grid grid-2">
            <MetricCard
              title="Avg latency"
              value={metrics ? `${metrics.avg_latency.toFixed(1)} ms` : "—"}
              hint="Mean over sliding window"
            />
            <MetricCard
              title="p95 latency"
              value={metrics ? `${metrics.p95_latency.toFixed(1)} ms` : "—"}
              hint="p95 over sliding window"
            />
          </div>

          <div className="card table-card">
            <div className="table">
              <div className="table-head">
                <span>Dependency</span>
                <span>Calls</span>
                <span>Errors</span>
              </div>
              <div className="table-body">
                {dependencyRows.map((row) => (
                  <div className="table-row" key={row.dep}>
                    <span>{row.dep}</span>
                    <span>{row.count}</span>
                    <span className="danger">{row.errors}</span>
                  </div>
                ))}
                {!dependencyRows.length && (
                  <div className="muted">No dependency data yet</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "logs" && (
        <>
          {logsError ? <ErrorState message="Failed to load logs" /> : null}
          {logsLoading ? <Loading /> : null}
          <div className="card table-card">
            <div className="table">
              <div className="table-head">
                <span>Timestamp</span>
                <span>Level</span>
                <span>Message</span>
                <span>Latency</span>
                <span>Trace</span>
                <span>Dependency</span>
              </div>
              <div className="table-body">
                {logs?.logs.map((log, idx) => (
                  <div className="table-row" key={idx}>
                    <span className="muted">{formatTs(log.timestamp)}</span>
                    <span className={log.level === "ERROR" ? "danger" : ""}>
                      {log.level}
                    </span>
                    <span>{log.message}</span>
                    <span>{log.latency_ms ? `${log.latency_ms} ms` : "—"}</span>
                    <span>{log.trace_id || "—"}</span>
                    <span>{log.dependency || "—"}</span>
                  </div>
                ))}
                {!logs?.logs.length && !logsLoading && (
                  <div className="muted">No recent logs</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "olap" && (
        <>
          {olapError ? <ErrorState message="Failed to load OLAP data" /> : null}
          <div className="card">
            <div className="panel-head">
              <h3>Time Range</h3>
              <select value={hours} onChange={(e) => setHours(Number(e.target.value))}>
                <option value={24}>Last 24h</option>
                <option value={48}>Last 48h</option>
                <option value={168}>Last 7d</option>
              </select>
            </div>
            {olapLoading && <Loading text="Loading history..." />}
            <div className="grid grid-1">
              <div className="chart-block">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={olapSeries}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="logs" stroke="#7c3aed" fill="#ede9fe" />
                    <Area type="monotone" dataKey="errors" stroke="#f87171" fill="#fee2e2" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-block">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={olapSeries}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="avg" stroke="#10b981" name="Avg" />
                    <Line type="monotone" dataKey="p95" stroke="#f59e0b" name="p95" />
                    <Line type="monotone" dataKey="error_rate" stroke="#ef4444" name="Error rate" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
