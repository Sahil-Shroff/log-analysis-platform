// db-writer/dbClient.ts
import { Pool } from "pg";

export const pool = new Pool({
  host: "localhost",
  port: 5434,
  user: "postgres",
  password: "password",   // Or ENV VAR later
  database: "log-analytics",
});

export async function initDb() {
  console.log("[db] Connecting to Postgres...");
  await pool.connect();
  console.log("[db] Connected to Postgres");
}
