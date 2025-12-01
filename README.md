# Log Analysis Platform – Running the Project (Current State)

This document explains how to run the project *as it exists so far*:
log generators → Kafka → debug consumer + abstractions.

The application currently consists of:

* Log generators (Typescript)
* Kafka abstraction layer (`producer.ts`, `consumer.ts`, shared client, topics)
* A debug consumer to read messages from Kafka
* Basic faker-based logs with trace IDs, hostnames, etc.

---

## 1. Prerequisites

You need the following installed locally:

### Node.js (v18+ recommended)

Check with:

```
node -v
```

### Typescript

```
npm install -g typescript ts-node
```

### Kafka + Zookeeper

Use any setup you prefer (Docker recommended). Example docker-compose:

```yaml
version: "3.8"
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
```

Start it:

```
docker compose up -d
```

---

## 2. Install Dependencies

From the project root:

```
npm install
```

If your Kafka utilities live in `/kafka` and `/log-generators`, install inside them too:

```
cd log-generators
npm install
```

Make sure `kafkajs` is installed:

```
npm install kafkajs
```

---

## 3. Project Structure (Current)

```
project/
  kafka/
    kafkaClient.ts
    producer.ts
    consumer.ts
    topics.ts

  log-generators/
    logUtils.ts
    index.ts        <-- script that calls generateLog()

  types.ts
```

---

## 4. Start Kafka Producer

Before generating logs you must connect the producer once.

In your app’s bootstrap file (or a dedicated script):

```ts
import { connectProducer } from "./kafka/producer.js";

await connectProducer();
```

Run it:

```
ts-node src/index.ts
```

Or however your project entry file is organized.

---

## 5. Running the Log Generator

Inside `log-generators/` you likely have a loop like:

```ts
import { generateLog } from "./logUtils.js";
import { connectProducer } from "../../kafka/producer.js";

await connectProducer();

setInterval(() => {
  generateLog("payment-service", "user-service");
}, 1000);
```

Run:

```
ts-node log-generators/index.ts
```

This will:

1. Connect to Kafka
2. Produce one log per second
3. Push to topic `raw_logs`

---

## 6. Running the Debug Consumer

In another terminal, from project root:

```
ts-node kafka/debugConsumer.ts
```

(Or whatever file name you chose.)

This internally does:

```ts
createConsumer(
  "debug-consumer",
  TOPICS.RAW_LOGS,
  async (log) => console.log("DEBUG >>", log)
);
```

When logs start flowing, you should see:

```
[kafka] Consumer debug-consumer subscribed to raw_logs
DEBUG >> { service: 'payment-service', level: 'INFO', ... }
```

---

## 7. Verify End-To-End Flow

You now have:

✔ Log generator producing fake logs
✔ Kafka producer abstraction publishing them
✔ Kafka broker receiving them
✔ Debug consumer reading them
✔ Topic names abstracted
✔ Code modular and ready for transform/validate pipeline

---

## 8. Troubleshooting

### If producer can't find Kafka:

Check if containers are running:

```
docker ps
```

Check logs:

```
docker logs kafka
```

Make sure topic exists:

```
kafka-topics.sh --bootstrap-server localhost:9092 --list
```

### If `Cannot find module kafkajs`

Run `npm install kafkajs` in the correct directory.

### If ES modules break

Use either:

```json
"type": "module"
```

or explicit extensions:

```
import { publish } from "./producer.js";
```