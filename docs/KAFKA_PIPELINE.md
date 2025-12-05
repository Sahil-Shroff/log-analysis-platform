# Kafka Pipeline Architecture

The Kafka stage performs:
1. Ingestion of raw logs.
2. Validation (schema checks).
3. Enrichment (trace IDs, hostname).
4. Routing logs into:
   - CLEAN_LOGS topic
   - ALERTS topic (for critical logs)

### Topics

Defined in `kafka/topics.ts`:

- `raw_logs`
- `clean_logs`
- `alerts`

### Shared Kafka Client

Located in `kafka/kafkaClient.ts`.

### Producer Wrapper

`kafka/producer.ts` exposes:
- `connectProducer()`
- `publish(topic, message)`

### Consumer Wrapper

`kafka/consumer.ts` exposes:
- `createConsumer(group, topic, handler)`

### Transform Service

Consumes `raw_logs`, publishes `clean_logs`.

See `transform-service/processor.ts` for validation + enrichment.

For runtime instructions:
See `RUNNING_THE_SYSTEM.md`.
