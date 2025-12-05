// db-writer/index.ts
import { createConsumer } from "../kafka/consumer.ts";
import { TOPICS } from "../kafka/topics.ts";
import { pool, initDb } from "./dbClient.ts";

async function writeLogToDb(log: any) {
  await pool.query(
    `INSERT INTO logs 
      (timestamp, service, level, message, trace_id, hostname, dependency, latency_ms, error_code, raw)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `,
    [
      log.timestamp,
      log.service,
      log.level,
      log.message,
      log.trace_id,
      log.hostname,
      log.dependency ?? null,
      log.latency_ms ?? null,
      log.error_code ?? null,
      log, // raw full object
    ]
  );
}

export async function startDbWriter() {
  await initDb();

  await createConsumer("db-writer", TOPICS.CLEAN_LOGS, async (msg) => {
    try {
      await writeLogToDb(msg);
      console.log(`[db-writer] inserted log from ${msg.service}`);
    } catch (err) {
      console.error("[db-writer] DB insert error:", err);
    }
  });

  console.log("[db-writer] Service running");
}

// Auto-start if run directly
startDbWriter().catch(console.error);
