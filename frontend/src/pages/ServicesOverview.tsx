import { useMemo } from "react";
import { Link } from "react-router-dom";
import { getServicesOverview } from "../api/client";
import { usePolling } from "../hooks/usePolling";
import { PageHeader } from "../components/PageHeader";
import { Loading } from "../components/Loading";
import { ErrorState } from "../components/ErrorState";
import { StatusPill } from "../components/StatusPill";
import type { ServiceOverviewItem } from "../api/types";

export default function ServicesOverviewPage() {
  const {
    data,
    loading,
    error
  } = usePolling<ServiceOverviewItem[]>(getServicesOverview, {
    intervalMs: 8000,
    immediate: true
  });

  const rows = useMemo(() => data || [], [data]);

  return (
    <div className="page">
      <PageHeader
        title="Services Overview"
        subtitle="One-stop snapshot of the 12 services pulled from Redis"
      />

      {error ? <ErrorState message="Failed to load services" /> : null}
      {loading ? <Loading /> : null}

      <div className="card table-card">
        <div className="table">
          <div className="table-head">
            <span>Service</span>
            <span>Logs/min</span>
            <span>Errors/min</span>
            <span>Avg Latency</span>
            <span>p95 Latency</span>
            <span>Health</span>
            <span>Status</span>
          </div>
          <div className="table-body">
            {rows.map((row) => (
              <div className="table-row" key={row.service}>
                <span>
                  <Link to={`/services/${row.service}`} className="link-strong">
                    {row.service}
                  </Link>
                </span>
                <span>{row.logs_per_min}</span>
                <span className="danger">{row.errors_per_min}</span>
                <span>{row.avg_latency.toFixed(1)} ms</span>
                <span>{row.p95_latency.toFixed(1)} ms</span>
                <span>
                  <StatusPill value={row.health_score} />
                </span>
                <span>
                  <span className={row.errors_per_min > 0 ? "status-pill warn" : "status-pill ok"}>
                    {row.errors_per_min > 0 ? "Degraded" : "Healthy"}
                  </span>
                </span>
              </div>
            ))}
            {!rows.length && !loading && <div className="muted">No services yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
