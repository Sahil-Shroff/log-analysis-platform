import { Pool } from "pg";

const pool = new Pool();
console.log("Connected OK");
await pool.end();
