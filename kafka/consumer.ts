import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "debug-consumer",
  brokers: ["localhost:9092"]
});

const consumer = kafka.consumer({ groupId: "debug-group" });

export async function startDebugConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: "raw_logs", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      console.log("Received:", message.value?.toString());
    }
  });
}

startDebugConsumer().catch(console.error);