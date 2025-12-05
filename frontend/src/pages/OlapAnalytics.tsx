import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
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
import { getGlobalOlap } from "../api/client";
import { usePolling } from "../hooks/usePolling";
import { PageHeader } from "../components/PageHeader";
import { Loading } from "../components/Loading";
import { ErrorState } from "../components/ErrorState";
import type { GlobalOlapResponse } from "../api/types";

function formatLabel(ts: string) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
}

export default function OlapAnalyticsPage() {
  const [hours, setHours] = useState(168);
  const {
    data,
    loading,
    error,
    refresh
  } = usePolling<GlobalOlapResponse>(() => getGlobalOlap(hours), {
    intervalMs: 60000,
    immediate: true,
    deps: [hours]
  });

  const series = useMemo(
    () =>
      data?.data.map((d) => ({
        time: formatLabel(d.timestamp),
        logs: d.logs,
        errors: d.errors,
        avg_latency: d.avg_latency,
        p95_latency: d.p95_latency
      })) || [],
    [data]
  );

  return (
    <div className="page">
      <PageHeader
        title="OLAP Analytics"
        subtitle="Hourly aggregations from Postgres service_analytics"
        actions={
          <div className="actions-inline">
            <select value={hours} onChange={(e) => setHours(Number(e.target.value))}>
              <option value={24}>Last 24h</option>
              <option value={72}>Last 3d</option>
              <option value={168}>Last 7d</option>
            </select>
            <button onClick={refresh}>Refresh</button>
          </div>
        }
      />

      {error ? <ErrorState message="Failed to load OLAP data" /> : null}
      {loading ? <Loading /> : null}

      <div className="grid grid-2">
        <div className="card">
          <h3>Hourly traffic & error rate</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="logs" fill="#7c3aed" name="Logs" />
              <Bar dataKey="errors" fill="#ef4444" name="Errors" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Latency trends</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avg_latency" stroke="#10b981" name="Avg" />
              <Line type="monotone" dataKey="p95_latency" stroke="#f59e0b" name="p95" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3>Error rate leaderboard</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={series}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="errors" stroke="#f87171" fill="#fee2e2" name="Errors" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
