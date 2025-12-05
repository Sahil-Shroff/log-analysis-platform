import { Router } from "express";
import { searchLogs } from "../controllers/logSearchController.js";

const router = Router();

router.get("/search", searchLogs);

export default router;
