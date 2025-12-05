# System Overview

The Log Analysis Platform processes structured logs through a multi-stage pipeline:

Log Generators -> Kafka -> Transform Service -> CLEAN_LOGS ->
- Redis Aggregator (real-time metrics)
- DB Writer (long-term storage)
- Alerts Stream
- OLAP Analytics (summary tables)

## Core Design Goals
- Demonstrate distributed log ingestion and processing.
- Show separation of real-time vs long-term analytics.
- Use cloud-native components (Kafka, Redis, Postgres).
- Emphasize modular architecture (each stage its own microservice).

## Components
See:
- `KAFKA_PIPELINE.md` — ingestion, validation, enrichment.
- `REDIS_METRIC.md` — real-time counters, latency, health, dependencies.
- `POSTGRES_STORAGE.md` — DB schema and writer service.
- `OLAP_ANALYTICS.md` — periodic heavy analytics into summary tables.
