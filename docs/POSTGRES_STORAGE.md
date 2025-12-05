# Postgres Storage Layer

CLEAN_LOGS are persisted for long-term analytics.

Table created as:

```sql
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ,
  service TEXT,
  level TEXT,
  message TEXT,
  trace_id TEXT,
  hostname TEXT,
  dependency TEXT,
  latency_ms INT,
  error_code TEXT,
  raw JSONB
);

CREATE INDEX idx_logs_ts ON logs (timestamp DESC);
CREATE INDEX idx_logs_service ON logs (service);
CREATE INDEX idx_logs_level ON logs (level);
CREATE INDEX idx_logs_trace ON logs (trace_id);
DB Writer Service
Consumes CLEAN_LOGS and inserts into Postgres.

See:

db-writer/index.ts

db-writer/dbClient.ts

Resetting DB
sql

docker exec -it postgres psql -U postgres -d logs_db
TRUNCATE logs;
---