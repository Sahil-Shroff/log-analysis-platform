import { useEffect, useMemo, useState } from "react";
import { getServiceRecentLogs, getServicesOverview } from "../api/client";
import { usePolling } from "../hooks/usePolling";
import { PageHeader } from "../components/PageHeader";
import { Loading } from "../components/Loading";
import { ErrorState } from "../components/ErrorState";
import type { ServiceRecentLogsResponse, ServiceOverviewItem } from "../api/types";

function levelClass(level: string) {
  if (level === "ERROR" || level === "CRITICAL") return "danger";
  if (level === "WARN" || level === "WARNING") return "warn";
  return "";
}

export default function LiveLogsPage() {
  const [services, setServices] = useState<ServiceOverviewItem[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    getServicesOverview()
      .then((data) => {
        setServices(data);
        if (!selected && data.length) {
          setSelected(data[0].service);
        }
      })
      .catch((err) => setError(err));
  }, []);

  const {
    data: logs,
    loading,
    error: logsError
  } = usePolling<ServiceRecentLogsResponse>(
    () => getServiceRecentLogs(selected),
    {
      intervalMs: 2000,
      immediate: true,
      enabled: Boolean(selected),
      deps: [selected]
    }
  );

  const rows = useMemo(() => logs?.logs || [], [logs]);

  return (
    <div className="page">
      <PageHeader
        title="Live Logs"
        subtitle="Tail -f style view sourced directly from Redis recentlogs"
        actions={
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {services.map((svc) => (
              <option key={svc.service} value={svc.service}>
                {svc.service}
              </option>
            ))}
          </select>
        }
      />

      {error ? <ErrorState message="Failed to load services" /> : null}
      {logsError ? <ErrorState message="Failed to fetch logs" /> : null}
      {loading ? <Loading text="Streaming..." /> : null}

      <div className="card log-stream">
        <div className="log-stream-body">
          {rows.map((log, idx) => (
            <div className="log-line" key={idx}>
              <span className="muted">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className={`log-level ${levelClass(log.level)}`}>{log.level}</span>
              <span className="log-service">{log.hostname || selected}</span>
              <span className="log-message">{log.message}</span>
              {log.trace_id && <span className="muted">trace: {log.trace_id}</span>}
            </div>
          ))}
          {!rows.length && <div className="muted">No logs yet</div>}
        </div>
      </div>
    </div>
  );
}
