import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller";

const router = Router();

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics (Total Stock Value, Low Stock Count, Dead Stock Count, etc.)
 */
router.get("/stats", getDashboardStats);

export default router;

