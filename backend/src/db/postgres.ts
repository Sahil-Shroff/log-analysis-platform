import pg from "pg";
const { Pool } = pg;

export const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "logsdb"
});

// ------------ OLAP -------------
export async function getServiceOLAPData(service: string, hours: number) {
  const query = `
    SELECT
      date_trunc('hour', timestamp) AS ts,
      COUNT(*) AS total_logs,
      COUNT(*) FILTER (WHERE level = 'ERROR') AS error_count,
      AVG(latency_ms) AS avg_latency,
      percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95_latency
    FROM logs
    WHERE service = $1
      AND timestamp >= NOW() - INTERVAL '${hours} hours'
    GROUP BY ts
    ORDER BY ts;
  `;

  const res = await pool.query(query, [service]);
  return res.rows;
}

// ------------ Global OLAP -------------
export async function getGlobalOLAP(hours: number) {
  const query = `
    SELECT
      date_trunc('hour', timestamp) AS ts,
      COUNT(*) AS logs,
      COUNT(*) FILTER (WHERE level = 'ERROR') AS errors,
      AVG(latency_ms) AS avg_latency,
      percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95_latency
    FROM logs
    WHERE timestamp >= NOW() - INTERVAL '${hours} hours'
    GROUP BY ts
    ORDER BY ts;
  `;

  return (await pool.query(query)).rows;
}

// ------------ LOG SEARCH -------------
export async function searchLogsQuery(params: any) {
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

  query += ` ORDER BY timestamp DESC LIMIT ${params.limit || 100}`;

  const res = await pool.query(query, values);
  return { total: res.rowCount, results: res.rows };
}
