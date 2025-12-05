import { Request, Response } from "express";
import {
  getSystemTrafficLastMin,
  getSystemErrorsLastMin,
  getSystemAvgLatency,
  getSystemP95Latency,
  getTopServicesByTraffic,
  getTopServicesByErrors
} from "../db/redisMetrics.js"; // new file we generate below

import type { DashboardSummary } from "../apiTypes.ts";

export async function getDashboardSummary(req: Request, res: Response) {
  try {
    const summary: DashboardSummary = {
      total_logs_last_min: await getSystemTrafficLastMin(),
      errors_last_min: await getSystemErrorsLastMin(),
      avg_latency: await getSystemAvgLatency(),
      p95_latency: await getSystemP95Latency(),
      top_services_by_traffic: await getTopServicesByTraffic(),
      top_services_by_errors: await getTopServicesByErrors(),
      system_health_score: 0 // optional: compute as avg of all services
    };

    res.json(summary);

  } catch (error) {
    console.error("[dashboard] failed:", error);
    res.status(500).json({ error: "Failed to load dashboard summary" });
  }
}
