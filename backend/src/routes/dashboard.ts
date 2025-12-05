import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboardController.ts";

const router = Router();

router.get("/summary", getDashboardSummary);

export default router;
