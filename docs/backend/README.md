# Backend Service — Overview

The backend service exposes REST APIs for:
- Real-time log insights (Redis)
- Raw log queries (Postgres)
- OLAP aggregations (Postgres OLAP table)
- Service discovery and metadata

It acts as the query layer of the Log Analysis Platform.

## Features

### Real-time data from Redis
- Traffic per service
- Error rates
- Latency averages
- Recent logs per service
- System-wide traffic trend (last 5 mins)

### Raw log search via PostgreSQL
- Filter by service, level, date range, trace_id
- Paginated results

### OLAP metrics
- Hourly counts inserted by an OLAP job
- Aggregations for dashboards

## Architecture
See: `docs/backend/architecture.md`

## API Documentation
All endpoints are described in:

- `docs/backend/API.md`
- OpenAPI schema: `docs/backend/openapi.yaml`

## Folder Structure

```
backend/
  src/
    server.ts
    apiTypes.ts
    routes/
      dashboard.ts
      services.ts
      logs.ts
    controllers/
      dashboardController.ts
      serviceController.ts
      logSearchController.ts
  db/
    redis.ts
    redisMetrics.ts
    postgres.ts
    olapQueries.ts
```

## Running the Server

Install dependencies:

```bash
cd backend
npm install
```

Start backend API:

```bash
npm run dev
```

Backend will run at:

http://localhost:4000

## How Data Flows to Backend

1. Log generators -> Kafka (`raw_logs`)
2. Transform-service validates and enriches -> `clean_logs`
3. Redis-aggregator consumes `clean_logs` and updates:
   - service lists
   - zsets for traffic and errors
   - latency sums and counts
   - last N recent logs
4. Postgres writer consumer writes raw logs to DB
5. OLAP job periodically aggregates hourly data to `log_olap`

Backend queries these two stores.

## Where to Go Next
- See API endpoints -> `API.md`
