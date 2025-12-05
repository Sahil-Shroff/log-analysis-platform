import { Request, Response } from "express";
import { redis } from "../db/redis.js";
import { getServiceOLAPData } from "../db/postgres.js";

// GET /api/services
export async function getAllServices(req: Request, res: Response) {
  try {
    const services = await redis.sMembers("services:list");

    const rows = [];
    for (const svc of services) {
      const logs = Number(await redis.get(`logs:${svc}:last_min`)) || 0;
      const errors = Number(await redis.get(`errors:${svc}:last_min`)) || 0;
      const avg = Number(await redis.get(`latency:${svc}:avg`)) || 0;
      const p95 = Number(await redis.get(`latency:${svc}:p95`)) || 0;
      const health = Number(await redis.get(`health:${svc}`)) || 0;

      rows.push({
        service: svc,
        logs_per_min: logs,
        errors_per_min: errors,
        avg_latency: avg,
        p95_latency: p95,
        health_score: health
      });
    }

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch services overview" });
  }
}

// GET /api/services/:service/metrics
export async function getServiceMetrics(req: Request, res: Response) {
  const svc = req.params.service;

  try {
    const logs = Number(await redis.get(`logs:${svc}:last_min`)) || 0;
    const errors = Number(await redis.get(`errors:${svc}:last_min`)) || 0;
    const avg = Number(await redis.get(`latency:${svc}:avg`)) || 0;
    const p95 = Number(await redis.get(`latency:${svc}:p95`)) || 0;
    const health = Number(await redis.get(`health:${svc}`)) || 0;

    const deps = await redis.hGetAll(`deps:${svc}:errors`);

    res.json({
      service: svc,
      logs_last_min: logs,
      errors_last_min: errors,
      avg_latency: avg,
      p95_latency: p95,
      health_score: health,
      dependency_errors: deps
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load service metrics" });
  }
}

// GET /api/services/:service/recent-logs
export async function getServiceRecentLogs(req: Request, res: Response) {
  const svc = req.params.service;

  try {
    const logs = await redis.lRange(`logbucket:${svc}`, -50, -1);
    res.json({ service: svc, logs: logs.map((l) => JSON.parse(l)) });
  } catch (err) {
    res.status(500).json({ error: "Failed to load recent logs" });
  }
}

// GET /api/services/:service/olap
export async function getServiceOLAP(req: Request, res: Response) {
  try {
    const svc = req.params.service;
    const hours = Number(req.query.hours) || 24;
    const data = await getServiceOLAPData(svc, hours);

    res.json({ service: svc, points: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch service OLAP" });
  }
}
