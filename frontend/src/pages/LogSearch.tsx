import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { getServicesOverview, searchLogs } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { Loading } from "../components/Loading";
import { ErrorState } from "../components/ErrorState";
import type { LogSearchResult, ServiceOverviewItem } from "../api/types";

interface Filters {
  service?: string;
  level?: string;
  keyword?: string;
  trace_id?: string;
  latency_gt?: string;
  from?: string;
  to?: string;
}

export default function LogSearchPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [result, setResult] = useState<LogSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceOverviewItem[]>([]);

  useEffect(() => {
    getServicesOverview().then(setServices).catch(() => setError("Failed to load services"));
  }, []);

  const runSearch = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await searchLogs({
        ...filters,
        limit: 100
      });
      setResult(res);
    } catch (err) {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <PageHeader title="Log Search" subtitle="SQL-powered search over Postgres logs" />

      <form className="card filter-form" onSubmit={runSearch}>
        <div className="form-grid">
          <label>
            <span>Service</span>
            <select
              value={filters.service || ""}
              onChange={(e) => setFilters((f) => ({ ...f, service: e.target.value || undefined }))}
            >
              <option value="">All</option>
              {services.map((svc) => (
                <option key={svc.service} value={svc.service}>
                  {svc.service}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Level</span>
            <select
              value={filters.level || ""}
              onChange={(e) => setFilters((f) => ({ ...f, level: e.target.value || undefined }))}
            >
              <option value="">Any</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </label>
          <label>
            <span>Keyword in message</span>
            <input
              type="text"
              value={filters.keyword || ""}
              onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value || undefined }))}
              placeholder="timeout OR payment"
            />
          </label>
          <label>
            <span>Trace ID</span>
            <input
              type="text"
              value={filters.trace_id || ""}
              onChange={(e) => setFilters((f) => ({ ...f, trace_id: e.target.value || undefined }))}
              placeholder="trace-123"
            />
          </label>
          <label>
            <span>Latency &gt;</span>
            <input
              type="number"
              value={filters.latency_gt || ""}
              onChange={(e) => setFilters((f) => ({ ...f, latency_gt: e.target.value || undefined }))}
              placeholder="ms"
            />
          </label>
          <label>
            <span>From</span>
            <input
              type="datetime-local"
              value={filters.from || ""}
              onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined }))}
            />
          </label>
          <label>
            <span>To</span>
            <input
              type="datetime-local"
              value={filters.to || ""}
              onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || undefined }))}
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="submit" className="primary">
            Run SQL
          </button>
        </div>
      </form>

      {loading && <Loading />}
      {error && <ErrorState message={error} />}

      <div className="card table-card">
        <div className="table">
          <div className="table-head">
            <span>Timestamp</span>
            <span>Service</span>
            <span>Level</span>
            <span>Message</span>
            <span>Trace</span>
            <span>Latency</span>
          </div>
          <div className="table-body">
            {result?.results.map((row) => (
              <div className="table-row" key={row.id}>
                <span className="muted">
                  {new Date(row.timestamp).toLocaleString()}
                </span>
                <span>{row.service}</span>
                <span className={row.level === "ERROR" ? "danger" : ""}>{row.level}</span>
                <span>{row.message}</span>
                <span>{row.trace_id || "—"}</span>
                <span>{row.latency_ms ? `${row.latency_ms} ms` : "—"}</span>
              </div>
            ))}
            {!result?.results.length && <div className="muted">No results yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
