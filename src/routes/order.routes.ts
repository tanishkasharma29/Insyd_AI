import { Router } from "express";
import {
  createOrder,
  reconcileOrder,
  getPendingOrders,
  getOrderById,
} from "../controllers/order.controller";

const router = Router();

/**
 * POST /api/orders
 * Create a new pending purchase order
 */
router.post("/", createOrder);

/**
 * GET /api/orders/pending
 * Get all pending orders
 */
router.get("/pending", getPendingOrders);

/**
 * DELETE /api/orders/:id
 * Order Reconciliation: Mark order as received and auto-increment inventory
 * Body (optional): { actualQuantity?: number, notes?: string }
 */
router.delete("/:id", reconcileOrder);

/**
 * GET /api/orders/:id
 * Get a specific order by ID
 */
router.get("/:id", getOrderById);

export default router;

