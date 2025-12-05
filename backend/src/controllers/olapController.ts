import { Request, Response } from "express";
import { getGlobalOLAP } from "../db/postgres.js";

export async function getGlobalOLAPMetrics(req: Request, res: Response) {
  try {
    const hours = Number(req.query.hours) || 24;
    const data = await getGlobalOLAP(hours);
    res.json({ hours, data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch OLAP metrics" });
  }
}
