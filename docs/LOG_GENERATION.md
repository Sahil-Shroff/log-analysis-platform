# Log Generation Model

The system includes a configurable log generator that simulates a realistic microservices environment.  
Twelve independent services emit structured JSON logs that flow into Kafka and through the rest of the pipeline.

---

## Microservices Simulated

The generator spawns **12 services**, each with its own behavior:

- `auth-service`
- `payment-service`
- `inventory-service`
- `order-service`
- `email-service`
- `notification-service`
- `search-service`
- `recommendation-service`
- `analytics-service`
- `user-service`
- `review-service`
- `gateway-service`

These represent a typical e-commerce–style architecture.

---

## Log Structure

Each generated log matches the following schema:

```ts
{
  service: string,
  level: "INFO" | "WARN" | "ERROR",
  message: string,
  timestamp: string,
  latency_ms: number,
  trace_id: string,
  dependency?: string,
  error_code?: string,
  hostname: string
}
```

# Log Generation Model

The system includes a configurable log generator that simulates a realistic microservices environment.  
Twelve independent services emit structured JSON logs that flow into Kafka and through the rest of the pipeline.

---

## Microservices Simulated

The generator spawns **12 services**, each with its own behavior:

- `auth-service`
- `payment-service`
- `inventory-service`
- `order-service`
- `email-service`
- `notification-service`
- `search-service`
- `recommendation-service`
- `analytics-service`
- `user-service`
- `review-service`
- `gateway-service`

These represent a typical e-commerce–style architecture.

---

## Log Structure

Each generated log matches the following schema:

```ts
{
  service: string,
  level: "INFO" | "WARN" | "ERROR",
  message: string,
  timestamp: string,
  latency_ms: number,
  trace_id: string,
  dependency?: string,
  error_code?: string,
  hostname: string
}
```

# Notes
- latency_ms is randomized (0–500ms) to support latency analytics.
- trace_id enables distributed tracing simulations.
- hostname reflects the machine generating the logs.
- error_code exists only for ERROR-level events.
- dependency enables dependency analysis and chaining via Redis.

# Log Levels
Logs are generated with realistic distributions:
- INFO (normal operations)
- WARN (degraded behavior)
- ERROR (failures, used for alerts + Redis error metrics)

Error logs use faker-generated messages plus synthetic error codes:
ERR_123, ERR_894, ...
These support:
- Postgres analytics of common error types
- Redis error counters
- ALERTS topic routing

# Service Dependencies
Certain services depend on others, allowing failure propagation:
Examples:
- payment-service → auth-service
- order-service → inventory-service
- gateway-service → auth-service
- recommendation-service → analytics-service

Dependency is included under:
dependency: "<service>"


Redis uses this to compute:
- dependency health
- dependency failure counts
- service health degradation

Purpose of Fake Log Data

The logs are intentionally structured to support:

✔ Real-time Redis metrics
- per-service log count
- error rate
- latency histograms
- service health scoring
- sliding window counts

✔ Long-term analytics in Postgres

- hourly error trends
- p95 latency
- dependency failure patterns
- top error codes
- daily log volume

✔ Realistic UI/visualization

- service dashboards
- live tail logs
- dependency heatmap
- latency charts
- Generation Frequency

Each service emits logs on an interval (configurable), typically:

1 log per second per service
≈ 12 logs/sec total


This provides enough volume for:

- high-resolution Redis buckets
- meaningful OLAP aggregates
- visible trends during demos

Where the Generator Lives

Implementation:

/log-generators/


Key modules:

- logUtils.ts → single log generation
- index.ts → main loop producing logs
- types.ts → log type definitions

Summary

The log generation layer intentionally simulates:

- distributed microservices
- traffic volume variance
- latency realism
- dependency chains
- operational errors
- structure suitable for OLAP + real-time metrics