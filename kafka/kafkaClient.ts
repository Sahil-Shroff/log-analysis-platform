import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "log-platform",
  brokers: ["localhost:9092"],
});
