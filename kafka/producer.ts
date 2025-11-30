import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "log-generator",
  brokers: ["localhost:9092"]
});

const producer = kafka.producer();

export async function initProducer() {
  await producer.connect();
  console.log("Kafka producer connected");
}

export async function sendLog(log: any) {
  await producer.send({
    topic: "raw_logs",
    messages: [{ value: JSON.stringify(log) }]
  });
}
