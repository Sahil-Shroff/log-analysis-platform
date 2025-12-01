import { kafka } from "../kafka/consumer.ts"; 
import { validateRawLog, enrichLog } from "./processor";

const consumer = kafka.consumer({ groupId: "transform-service" });
const producer = kafka.producer();

export async function startTransformService() {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: "raw-logs", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const raw = JSON.parse(message.value!.toString());

        if (!validateRawLog(raw)) {
          return; // discard or publish to DLQ later
        }

        const enriched = enrichLog(raw);

        await producer.send({
          topic: "normalized-logs",
          messages: [{ value: JSON.stringify(enriched) }]
        });

        if (enriched.level === "CRITICAL") {
          await producer.send({
            topic: "alerts",
            messages: [{ value: JSON.stringify(enriched) }]
          });
        }

      } catch (err) {
        console.error("Failed to process log:", err);
      }
    }
  });
}
