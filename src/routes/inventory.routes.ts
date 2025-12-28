import { Router } from "express";
import {
  createInventory,
  getAllInventory,
  updateInventory,
  deleteInventory,
  getInventoryStatus,
} from "../controllers/inventory.controller";

const router = Router();

/**
 * POST /api/inventory
 * Create new product and inventory entry
 */
router.post("/", createInventory);

/**
 * GET /api/inventory
 * Get all inventory items with filtering options
 * Query params: category, status, search
 */
router.get("/", getAllInventory);

/**
 * PATCH /api/inventory/:sku
 * Update inventory/product details
 */
router.patch("/:sku", updateInventory);

/**
 * DELETE /api/inventory/:sku
 * Stock-Out: Sell/dispatch inventory
 * Body: { sellerName: string, customerName?: string, quantity: number, notes?: string }
 */
router.delete("/:sku", deleteInventory);

/**
 * GET /api/inventory/:sku/status
 * Get inventory status including dead stock flag
 */
router.get("/:sku/status", getInventoryStatus);

export default router;

