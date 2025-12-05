# OLAP Analytics Layer

The analytics stage computes long-term statistics from the `logs` table. It can run manually or as a scheduled job.

## Summary Table

```sql
CREATE TABLE service_analytics (
    id SERIAL PRIMARY KEY,
    time_bucket TIMESTAMPTZ NOT NULL,
    service TEXT NOT NULL,
    log_count INT NOT NULL,
    error_count INT NOT NULL,
    error_rate NUMERIC(5,3),
    avg_latency NUMERIC,
    p95_latency NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## OLAP Computations

Hourly aggregates:

```sql
SELECT
  date_trunc('hour', timestamp) AS bucket,
  service,
  COUNT(*) AS log_count,
  COUNT(*) FILTER (WHERE level IN ('ERROR', 'CRITICAL')) AS error_count,
  AVG(latency_ms) AS avg_latency,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95
FROM logs
GROUP BY bucket, service;
```

## Script
`analytics/runAnalytics.ts` stores results into `service_analytics`.

## Usage

```bash
node analytics/runAnalytics.ts
```

Analytics then become available to REST API endpoints, UI dashboards, and trend visualizations.
