import { Router } from "express";
import { getGlobalOLAPMetrics } from "../controllers/olapController.js";

const router = Router();

router.get("/metrics", getGlobalOLAPMetrics);

export default router;
