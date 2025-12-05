import pg from "pg";
const { Pool } = pg;

export const pool = new Pool({
  host: "localhost",
  port: 5434,
  user: "cloudsqlsuperuser",
  password: "password",
  database: "log-analytics",
});

export interface LogRow {
  id: number;
  timestamp: string;
  service: string;
  level: string;
  message: string;
  trace_id: string | null;
  hostname: string | null;
  dependency: string | null;
  latency_ms: number | null;
  error_code: string | null;
  raw: any;
}

export interface ServiceOlapPoint {
  timestamp: string;
  total_logs: number;
  error_count: number;
  error_rate: number;
  avg_latency: number | null;
  p95_latency: number | null;
}

// ---- Service-level OLAP ----

export async function getServiceOLAPData(
  service: string,
  hours: number
): Promise<ServiceOlapPoint[]> {
  const query = `
    SELECT
      date_trunc('hour', timestamp) AS timestamp,
      COUNT(*) AS total_logs,
      COUNT(*) FILTER (WHERE level IN ('ERROR','CRITICAL')) AS error_count,
      ROUND(
        COUNT(*) FILTER (WHERE level IN ('ERROR','CRITICAL'))::numeric
        / NULLIF(COUNT(*), 0), 3
      ) AS error_rate,
      AVG(latency_ms)::numeric AS avg_latency,
      percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95_latency
    FROM logs
    WHERE service = $1
      AND timestamp >= NOW() - INTERVAL '${hours} hours'
    GROUP BY 1
    ORDER BY 1;
  `;

  const res = await pool.query(query, [service]);
  return res.rows;
}

// ---- Global OLAP ----

export interface GlobalOlapPoint {
  timestamp: string;
  logs: number;
  errors: number;
  avg_latency: number | null;
  p95_latency: number | null;
}

export async function getGlobalOLAP(hours: number): Promise<GlobalOlapPoint[]> {
  const query = `
    SELECT
      date_trunc('hour', timestamp) AS timestamp,
      COUNT(*) AS logs,
      COUNT(*) FILTER (WHERE level IN ('ERROR','CRITICAL')) AS errors,
      AVG(latency_ms)::numeric AS avg_latency,
      percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95_latency
    FROM logs
    WHERE timestamp >= NOW() - INTERVAL '${hours} hours'
    GROUP BY 1
    ORDER BY 1;
  `;

  const res = await pool.query(query);
  return res.rows;
}

// ---- Log search ----

export interface LogSearchParams {
  service?: string;
  level?: string;
  trace_id?: string;
  keyword?: string;
  latency_gt?: string | number;
  from?: string;
  to?: string;
  limit?: string | number;
  offset?: string | number;
}

export async function searchLogsQuery(params: LogSearchParams) {
  let query = `SELECT * FROM logs WHERE 1=1`;
  const values: any[] = [];
  let idx = 1;

  if (params.service) {
    query += ` AND service = $${idx++}`;
    values.push(params.service);
  }
  if (params.level) {
    query += ` AND level = $${idx++}`;
    values.push(params.level);
  }
  if (params.trace_id) {
    query += ` AND trace_id = $${idx++}`;
    values.push(params.trace_id);
  }
  if (params.keyword) {
    query += ` AND message ILIKE $${idx++}`;
    values.push(`%${params.keyword}%`);
  }
  if (params.latency_gt) {
    query += ` AND latency_ms > $${idx++}`;
    values.push(Number(params.latency_gt));
  }
  if (params.from) {
    query += ` AND timestamp >= $${idx++}`;
    values.push(params.from);
  }
  if (params.to) {
    query += ` AND timestamp <= $${idx++}`;
    values.push(params.to);
  }

  const limit = Number(params.limit) || 100;
  const offset = Number(params.offset) || 0;

  query += ` ORDER BY timestamp DESC LIMIT ${limit} OFFSET ${offset}`;

  const res = await pool.query<LogRow>(query, values);
  return { total: res.rowCount, results: res.rows };
}
