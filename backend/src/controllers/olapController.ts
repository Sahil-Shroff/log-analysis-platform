import type { Request, Response } from "express";
import { getGlobalOLAP } from "../db/postgres.ts";

import type { GlobalOlapResponse } from "../apiTypes.ts";

export async function getGlobalOLAPMetrics(req: Request, res: Response) {
  const hours = Number(req.query.hours) || 24;

  try {
    const data = await getGlobalOLAP(hours);

    const response: GlobalOlapResponse = {
      hours,
      data
    };

    res.json(response);

  } catch (error) {
    console.error("[global olap] failed:", error);
    res.status(500).json({ error: "Failed to load OLAP metrics" });
  }
}
