import type { Request, Response } from "express";
import { searchLogsQuery } from "../db/postgres.ts";
import type { LogSearchResult } from "../apiTypes.ts";

export async function searchLogs(req: Request, res: Response) {
  try {
    const result: LogSearchResult = await searchLogsQuery(req.query);
    res.json(result);

  } catch (error) {
    console.error("[log search] failed:", error);
    res.status(500).json({ error: "Log search failed" });
  }
}
