import { kafka } from "./kafkaClient.js";

export async function createConsumer(groupId: string, topic: string, handler: (msg: any) => Promise<void>) {
  const consumer = kafka.consumer({ groupId });

  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });

  console.log(`[kafka] Consumer ${groupId} subscribed to ${topic}`);

  await consumer.run({
    eachMessage: async ({ message }) => {
      const value = message.value?.toString();
      if (!value) return;

      try {
        const parsed = JSON.parse(value);
        await handler(parsed);
      } catch (err) {
        console.error("Failed to process message:", err);
      }
    },
  });

  return consumer;
}
