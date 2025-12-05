# Running the System

This document describes how to start the full log pipeline.

## 1. Start Infrastructure

Kafka, Zookeeper, and Redis run via Docker. If you haven't already, see the repo's `docker-compose.yaml`.

Start stack:

```bash
docker compose up -d
docker ps
```

## 2. Install Dependencies

From project root:

```bash
npm install
```

Also install inside sub-projects:

```bash
cd log-generators && npm install
cd db-writer && npm install  # if separate
```

## 3. Start Each Service

### Log Generators

```bash
npm run start --workspace=log-generators
```

### Transform Service

```bash
npm run start --workspace=transform-service
```

### Redis Aggregator

```bash
npm run start --workspace=redis-aggregator
```

### DB Writer

```bash
npm run start --workspace=db-writer
```

## 4. Debugging

### Test Kafka

```bash
docker exec -it kafka kafka-topics --bootstrap-server localhost:9092 --list
```

### Test Redis

```bash
docker exec -it redis redis-cli
```

### Test Postgres

Use `psql` or your DB client.

## 5. End-to-End Verification

After starting all services, you should observe:

- Kafka receiving logs in `raw_logs`.
- Transform publishing logs to `CLEAN_LOGS`.
- Redis updating counters.
- Postgres filling the `logs` table.

See other docs for deeper component details.
