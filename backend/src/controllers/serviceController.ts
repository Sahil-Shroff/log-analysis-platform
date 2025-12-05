import { Request, Response } from "express";

import {
  getServiceLogCount,
  getServiceErrorCount,
  getServiceLatencyAvg,
  getServiceLatencyP95,
  getServiceHealth,
  getServiceRecentLogs,
  getServiceDependencyStats
} from "../db/redis.js";

import {
  getServiceOLAPData
} from "../db/postgres.js";

import type {
  ServiceOverviewItem,
  ServiceMetrics,
  ServiceRecentLogsResponse,
  ServiceOlapResponse
} from "../apiTypes.ts";

export async function getAllServices(req: Request, res: Response) {
  try {
    const services = await redis.smembers("services:list");

    const response: ServiceOverviewItem[] = [];

    for (const svc of services) {
      const item: ServiceOverviewItem = {
        service: svc,
        logs_per_min: await getServiceLogCount(svc),
        errors_per_min: await getServiceErrorCount(svc),
        avg_latency: await getServiceLatencyAvg(svc),
        p95_latency: await getServiceLatencyP95(svc),
        health_score: await getServiceHealth(svc)
      };

      response.push(item);
    }

    res.json(response);

  } catch (error) {
    console.error("[services] failed:", error);
    res.status(500).json({ error: "Failed to load services" });
  }
}

export async function getServiceMetrics(req: Request, res: Response) {
  const svc = req.params.service;

  try {
    const metrics: ServiceMetrics = {
      service: svc,
      logs_last_min: await getServiceLogCount(svc),
      errors_last_min: await getServiceErrorCount(svc),
      avg_latency: await getServiceLatencyAvg(svc),
      p95_latency: await getServiceLatencyP95(svc),
      health_score: await getServiceHealth(svc),
      dependency_errors: await getServiceDependencyStats(svc)
    };

    res.json(metrics);

  } catch (error) {
    console.error(`[service metrics] ${svc}:`, error);
    res.status(500).json({ error: "Failed to load service metrics" });
  }
}

export async function getServiceRecentLogs(req: Request, res: Response) {
  const svc = req.params.service;

  try {
    const logs = await getServiceRecentLogs(svc);

    const response: ServiceRecentLogsResponse = {
      service: svc,
      logs
    };

    res.json(response);

  } catch (error) {
    console.error(`[recent logs] ${svc}:`, error);
    res.status(500).json({ error: "Failed to load logs" });
  }
}

export async function getServiceOLAP(req: Request, res: Response) {
  const svc = req.params.service;
  const hours = Number(req.query.hours) || 24;

  try {
    const points = await getServiceOLAPData(svc, hours);

    const response: ServiceOlapResponse = {
      service: svc,
      points
    };

    res.json(response);

  } catch (error) {
    console.error(`[OLAP] ${svc}:`, error);
    res.status(500).json({ error: "Failed to load OLAP data" });
  }
}
