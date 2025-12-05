import { pool } from "../db-writer/dbClient.js";

export async function runAnalytics() {
  console.log("[analytics] Running...");

  const results = await pool.query(`
    SELECT
      date_trunc('hour', timestamp) AS bucket,
      service,
      COUNT(*) AS log_count,
      COUNT(*) FILTER (WHERE level IN ('ERROR','CRITICAL')) AS error_count,
      ROUND(
        COUNT(*) FILTER (WHERE level IN ('ERROR','CRITICAL'))::numeric
        / COUNT(*), 3
      ) AS error_rate,
      AVG(latency_ms) AS avg_latency,
      percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95_latency
    FROM logs
    GROUP BY bucket, service
    ORDER BY bucket DESC, service;
  `);

  for (const row of results.rows) {
    await pool.query(
      `INSERT INTO service_analytics 
       (time_bucket, service, log_count, error_count, error_rate, avg_latency, p95_latency)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        row.bucket,
        row.service,
        row.log_count,
        row.error_count,
        row.error_rate,
        row.avg_latency,
        row.p95_latency
      ]
    );
  }

  console.log("[analytics] Stored", results.rows.length, "rows.");
}

runAnalytics().catch(console.error);
