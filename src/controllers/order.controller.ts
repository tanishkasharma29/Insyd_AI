import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { getPrismaClient } from "../utils/db";
import { handleDatabaseError } from "../utils/errorHandler";
import { OrderReconciliationRequest, CreateOrderRequest } from "../types";

const prisma = getPrismaClient();

/**
 * POST /orders
 * Create a new pending purchase order
 */
export const createOrder = async (
  req: Request<{}, {}, CreateOrderRequest>,
  res: Response
): Promise<void> => {
  try {
    const { productId, sku, quantity, expectedDate, supplierId, unitCostPrice, notes } = req.body;

    // Validation
    if (!productId || !sku || !quantity || !expectedDate || !supplierId) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: productId, sku, quantity, expectedDate, supplierId",
      });
      return;
    }

    if (quantity <= 0) {
      res.status(400).json({
        success: false,
        error: "Quantity must be a positive number",
      });
      return;
    }

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { supplier: true },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        error: `Product with ID ${productId} not found`,
      });
      return;
    }

    // Verify SKU matches product
    if (product.sku !== sku) {
      res.status(400).json({
        success: false,
        error: `SKU ${sku} does not match product ID ${productId}`,
      });
      return;
    }

    // Validate supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      res.status(404).json({
        success: false,
        error: `Supplier with ID ${supplierId} not found`,
      });
      return;
    }

    // Verify supplier matches product supplier (optional business rule)
    if (product.supplierId !== supplierId) {
      res.status(400).json({
        success: false,
        error: `Product is associated with a different supplier. Product supplier: ${product.supplier.name}`,
      });
      return;
    }

    // Create pending order
    const order = await prisma.pendingOrder.create({
      data: {
        productId,
        sku,
        quantity,
        expectedDate: new Date(expectedDate),
        supplierId,
        unitCostPrice: unitCostPrice || product.unitCostPrice,
        notes: notes?.trim(),
        status: "PENDING",
      },
      include: {
        product: {
          select: {
            name: true,
            category: true,
          },
        },
        supplier: {
          select: {
            name: true,
            contact: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: `Pending order created for ${order.product.name} (SKU: ${order.sku})`,
      data: {
        id: order.id,
        sku: order.sku,
        productName: order.product.name,
        category: order.product.category,
        quantity: order.quantity,
        expectedDate: order.expectedDate,
        supplierName: order.supplier.name,
        supplierContact: order.supplier.contact,
        unitCostPrice: order.unitCostPrice,
        status: order.status,
        notes: order.notes,
        createdAt: order.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error in createOrder:", error);
    
    // Handle database connection errors
    if (handleDatabaseError(error, res)) {
      return; // Error was handled
    }
    
    res.status(500).json({
      success: false,
      error: "Internal server error during order creation",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * DELETE /orders/:id
 * Order Reconciliation: Mark pending order as received and auto-increment inventory
 * 
 * Business Logic (The "Order-to-Inventory Sync"):
 * 1. Finds the pending order
 * 2. Validates order is in PENDING status
 * 3. Creates or updates inventory record (increment quantity)
 * 4. Updates lastRestockedAt timestamp
 * 5. Creates audit log entry with reason "Restock"
 * 6. Marks order as RECEIVED with receivedAt timestamp
 * 
 * This solves the "Order-to-Inventory Sync" requirement where completing
 * an order automatically updates stock levels.
 * 
 * @param req - Express request with order id in params and optional reconciliation data in body
 * @param res - Express response
 */
export const reconcileOrder = async (
  req: Request<{ id: string }, {}, OrderReconciliationRequest>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { actualQuantity, notes } = req.body;

    // Find the pending order with related product and supplier
    const pendingOrder = await prisma.pendingOrder.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            inventory: true,
            supplier: true,
          },
        },
        supplier: true,
      },
    });

    if (!pendingOrder) {
      res.status(404).json({
        success: false,
        error: `Pending order with ID ${id} not found`,
      });
      return;
    }

    // Validate order status
    if (pendingOrder.status !== "PENDING") {
      res.status(400).json({
        success: false,
        error: `Order is already ${pendingOrder.status}. Cannot reconcile.`,
        currentStatus: pendingOrder.status,
      });
      return;
    }

    // Use actualQuantity if provided (for partial fulfillment), otherwise use ordered quantity
    const quantityToAdd = actualQuantity ?? pendingOrder.quantity;

    if (quantityToAdd <= 0) {
      res.status(400).json({
        success: false,
        error: "Quantity must be a positive number",
      });
      return;
    }

    // Perform atomic transaction: Update inventory + Create audit log + Update order status
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const product = pendingOrder.product;

      // 1. Create or update inventory record
      let inventory;
      if (product.inventory) {
        // Inventory exists: increment current quantity
        inventory = await tx.inventory.update({
          where: { productId: product.id },
          data: {
            currentQuantity: {
              increment: quantityToAdd,
            },
            lastRestockedAt: new Date(),
            updatedAt: new Date(),
          },
        });
      } else {
        // Inventory doesn't exist: create new record
        inventory = await tx.inventory.create({
          data: {
            productId: product.id,
            currentQuantity: quantityToAdd,
            lastRestockedAt: new Date(),
          },
        });
      }

      // 2. Create audit log entry for traceability
      const auditLog = await tx.auditLog.create({
        data: {
          sku: product.sku,
          productId: product.id,
          changeAmount: quantityToAdd, // Positive for stock-in
          reason: "Restock",
          vendorName: pendingOrder.supplier.name,
          notes: notes?.trim() || `Order ${id} received. ${actualQuantity ? `Partial fulfillment: ${actualQuantity} of ${pendingOrder.quantity} units.` : "Full order received."}`,
        },
      });

      // 3. Update pending order status to RECEIVED
      const updatedOrder = await tx.pendingOrder.update({
        where: { id },
        data: {
          status: "RECEIVED",
          receivedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        inventory,
        auditLog,
        order: updatedOrder,
      };
    });

    // Calculate new inventory status
    const newQuantity = result.inventory.currentQuantity;
    const minThreshold = pendingOrder.product.minThreshold;
    let status: "SAFE" | "LOW" | "CRITICAL" | "OUT_OF_STOCK";
    if (newQuantity === 0) {
      status = "OUT_OF_STOCK";
    } else if (newQuantity < minThreshold * 0.3) {
      status = "CRITICAL";
    } else if (newQuantity < minThreshold) {
      status = "LOW";
    } else {
      status = "SAFE";
    }

    res.status(200).json({
      success: true,
      message: `Order ${id} reconciled successfully. Stock updated for SKU ${pendingOrder.sku}`,
      data: {
        orderId: id,
        sku: pendingOrder.sku,
        productName: pendingOrder.product.name,
        quantityAdded: quantityToAdd,
        orderedQuantity: pendingOrder.quantity,
        wasPartialFulfillment: actualQuantity !== undefined && actualQuantity !== pendingOrder.quantity,
        inventory: {
          previousQuantity: result.inventory.currentQuantity - quantityToAdd,
          newQuantity: result.inventory.currentQuantity,
          status,
        },
        auditLogId: result.auditLog.id,
        receivedAt: result.order.receivedAt,
      },
    });
  } catch (error: any) {
    console.error("Error in reconcileOrder:", error);
    
    // Handle database connection errors
    if (handleDatabaseError(error, res)) {
      return; // Error was handled
    }
    
    res.status(500).json({
      success: false,
      error: "Internal server error during order reconciliation",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /orders/pending
 * Get all pending orders with their details
 */
export const getPendingOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const orders = await prisma.pendingOrder.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true,
            category: true,
            unitCostPrice: true,
            minThreshold: true,
          },
        },
        supplier: {
          select: {
            name: true,
            contact: true,
          },
        },
      },
      orderBy: {
        expectedDate: "asc", // Show soonest expected orders first
      },
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders.map((order) => ({
        id: order.id,
        sku: order.sku,
        productName: order.product.name,
        category: order.product.category,
        quantity: order.quantity,
        expectedDate: order.expectedDate,
        supplierName: order.supplier.name,
        supplierContact: order.supplier.contact,
        unitCostPrice: order.unitCostPrice || order.product.unitCostPrice,
        notes: order.notes,
        createdAt: order.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Error in getPendingOrders:", error);
    
    // Handle database connection errors
    if (handleDatabaseError(error, res)) {
      return; // Error was handled
    }
    
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /orders/:id
 * Get a specific order by ID
 */
export const getOrderById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await prisma.pendingOrder.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            inventory: true,
          },
        },
        supplier: true,
      },
    });

    if (!order) {
      res.status(404).json({
        success: false,
        error: `Order with ID ${id} not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: order.id,
        sku: order.sku,
        product: {
          name: order.product.name,
          category: order.product.category,
          currentStock: order.product.inventory?.currentQuantity ?? 0,
          minThreshold: order.product.minThreshold,
        },
        quantity: order.quantity,
        expectedDate: order.expectedDate,
        status: order.status,
        supplier: {
          name: order.supplier.name,
          contact: order.supplier.contact,
          email: order.supplier.email,
        },
        unitCostPrice: order.unitCostPrice,
        notes: order.notes,
        createdAt: order.createdAt,
        receivedAt: order.receivedAt,
      },
    });
  } catch (error: any) {
    console.error("Error in getOrderById:", error);
    
    // Handle database connection errors
    if (handleDatabaseError(error, res)) {
      return; // Error was handled
    }
    
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

