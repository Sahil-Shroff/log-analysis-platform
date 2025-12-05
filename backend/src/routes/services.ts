import { Router } from "express";
import {
  getAllServices,
  getServiceMetrics,
  getServiceRecentLogs,
  getServiceOLAP
} from "../controllers/serviceController.js";

const router = Router();

// /api/services
router.get("/", getAllServices);

// /api/services/:service/metrics
router.get("/:service/metrics", getServiceMetrics);

// /api/services/:service/recent-logs
router.get("/:service/recent-logs", getServiceRecentLogs);

// /api/services/:service/olap
router.get("/:service/olap", getServiceOLAP);

export default router;
