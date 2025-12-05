# Redis Metrics Layer

The Redis Aggregator consumes CLEAN_LOGS and maintains real-time observability metrics.

Implementation in: `redis-aggregator/index.ts`

## Phase 1 — Basic Counters
- `service:<name>:count`
- `service:<name>:errors`

These support traffic volume indicators and error rate charts.

## Phase 2 — Latency + Sliding Windows

### Latency Aggregation
- `latency:<service>:sum`
- `latency:<service>:count`
- `latency:<service>:samples` (sorted set for p95)

### Sliding-Window Log Volume (per minute)
- `logbucket:<service>:<timestamp>`

## Phase 3 — Advanced Observability

### Service Health Score
- `service:<name>:health`

### Dependency Metrics
- `dependency:<service>:<dependency>:count`
- `dependency:<service>:<dependency>:errors`

### Recent Logs (tail view)
- `recentlogs:<service>`

## Inspecting Metrics

```bash
docker exec -it redis redis-cli
KEYS *
GET service:auth-service:health
LRANGE recentlogs:payment-service 0 10
```
