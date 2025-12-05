# Log Analysis Platform

This project implements a distributed log processing pipeline inspired by modern observability systems (ELK, Datadog, Splunk).

Core stages:
1. Log Generators → simulate multiple microservices.
2. Kafka Pipeline → ingestion, validation, enrichment.
3. Redis Metrics → real-time counters, latency stats, health scores.
4. Postgres Storage → long-term log retention.
5. OLAP Analytics → periodic aggregations for dashboards.

To run the system or explore individual components, see the documentation in `/docs`.

## Documentation

- **System Overview** — `docs/OVERVIEW.md`
- **How to Run Everything** — `docs/RUNNING_THE_SYSTEM.md`
- **Kafka Pipeline Architecture** — `docs/KAFKA_PIPELINE.md`
- **Redis Metrics (Phases 1–3)** — `docs/REDIS_METRICS.md`
- **Postgres Schema & Storage** — `docs/POSTGRES_STORAGE.md`
- **OLAP Analytics** — `docs/OLAP_ANALYTICS.md`
