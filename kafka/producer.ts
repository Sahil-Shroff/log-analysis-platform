import { kafka } from "./kafkaClient.js";

let producer: ReturnType<typeof kafka.producer> | null = null;

export async function connectProducer() {
  if (producer) return producer;

  producer = kafka.producer();
  await producer.connect();
  console.log("[kafka] Producer connected");

  return producer;
}

export async function publish(topic: string, message: unknown) {
  if (!producer) {
    throw new Error("Producer not initialized. Call connectProducer() first.");
  }

  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
}
