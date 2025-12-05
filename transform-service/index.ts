// transform-service/index.ts
import { createConsumer } from "../kafka/consumer.ts";
import { connectProducer, publish } from "../kafka/producer.ts";
import { TOPICS } from "../kafka/topics.ts";
import { validateRawLog, enrichLog } from "./processor.ts";

export async function startTransformService() {
  const producer = await connectProducer();

  await createConsumer("transform-service", TOPICS.RAW_LOGS, async (raw) => {
    // 1. Validation
    if (!validateRawLog(raw)) {
      console.log("Discarding invalid log");
      return;  
    }

    // 2. Enrichment
    const enriched = enrichLog(raw);

    // 3. Publish clean logs
    await publish(TOPICS.CLEAN_LOGS, enriched);

    // 4. Publish CRITICAL logs to alerts
    if (enriched.level === "CRITICAL") {
      await publish(TOPICS.ALERTS, enriched);
    }
  });

  console.log("[transform] Service started");
}

startTransformService().catch((error) => {
  console.error("Error starting transform service:", error);
});