import { Request, Response } from "express";
import { searchLogsQuery } from "../db/postgres.js";

export async function searchLogs(req: Request, res: Response) {
  try {
    const results = await searchLogsQuery(req.query);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search logs" });
  }
}
