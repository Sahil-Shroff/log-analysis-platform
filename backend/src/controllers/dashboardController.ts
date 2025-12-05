import { Request, Response } from "express";
import { redis } from "../db/redis.js";
import { getSystemOLAPSummary } from "../db/postgres.js";

export async function getDashboardSummary(req: Request, res: Response) {
  try {
    const traffic = await redis.get("system:logs_last_min");
    const errors = await redis.get("system:errors_last_min");
    const avgLatency = await redis.get("system:avg_latency");
    const p95Latency = await redis.get("system:p95_latency");

    const topTraffic = await redis.zRangeWithScores("service:traffic", 0, -1);
    const topErrors = await redis.zRangeWithScores("service:errors", 0, -1);

    const summary = {
      total_logs_last_min: Number(traffic) || 0,
      errors_last_min: Number(errors) || 0,
      avg_latency: Number(avgLatency) || 0,
      p95_latency: Number(p95Latency) || 0,
      top_services_by_traffic: topTraffic,
      top_services_by_errors: topErrors
    };

    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load dashboard summary" });
  }
}
