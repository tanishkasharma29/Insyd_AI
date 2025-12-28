import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { getPrismaClient } from "../utils/db";
import {
  StockOutRequest,
  CreateInventoryRequest,
  UpdateInventoryRequest,
} from "../types";

const prisma = getPrismaClient();

/**
 * POST /inventory
 * Create new product and inventory entry
 *
 * Creates both a Product record and initial Inventory record
 */
export const createInventory = async (
  req: Request<{}, {}, CreateInventoryRequest>,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      sku,
      category,
      unitCostPrice,
      unitSellingPrice,
      supplierId,
      minThreshold = 10,
      initialQuantity = 0,
      storageLocation,
      expiryDate,
      routineCheckPeriodDays,
    } = req.body;

    // Validation
    if (
      !name ||
      !sku ||
      !category ||
      unitCostPrice === undefined ||
      unitSellingPrice === undefined ||
      !supplierId
    ) {
      res.status(400).json({
        success: false,
        error:
          "Missing required fields: name, sku, category, unitCostPrice, unitSellingPrice, supplierId",
      });
      return;
    }

    // Check if supplier exists
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

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      res.status(400).json({
        success: false,
        error: `Product with SKU ${sku} already exists`,
      });
      return;
    }

    // Create product and inventory in a transaction
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Create product
        const product = await tx.product.create({
          data: {
            name: name.trim(),
            sku: sku.trim(),
            category: category.trim(),
            unitCostPrice,
            unitSellingPrice,
            supplierId,
            minThreshold,
          },
        });

        // 2. Create inventory record
        const inventory = await tx.inventory.create({
          data: {
            productId: product.id,
            currentQuantity: initialQuantity,
            storageLocation: storageLocation?.trim(),
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            routineCheckPeriodDays: routineCheckPeriodDays || null,
            lastRestockedAt: initialQuantity > 0 ? new Date() : null,
          },
        });

        // 3. If initial quantity > 0, create audit log
        if (initialQuantity > 0) {
          await tx.auditLog.create({
            data: {
              sku: product.sku,
              productId: product.id,
              changeAmount: initialQuantity,
              reason: "Restock",
              vendorName: supplier.name,
              notes: "Initial inventory entry",
            },
          });
        }

        return { product, inventory };
      }
    );

    res.status(201).json({
      success: true,
      message: `Product ${result.product.name} (SKU: ${result.product.sku}) created successfully`,
      data: {
        product: {
          id: result.product.id,
          name: result.product.name,
          sku: result.product.sku,
          category: result.product.category,
          unitCostPrice: result.product.unitCostPrice,
          unitSellingPrice: result.product.unitSellingPrice,
          minThreshold: result.product.minThreshold,
        },
        inventory: {
          currentQuantity: result.inventory.currentQuantity,
          storageLocation: result.inventory.storageLocation,
        },
      },
    });
  } catch (error: any) {
    console.error("Error in createInventory:", error);

    // Handle Prisma database connection errors
    if (error?.code === "P1001" || error?.code === "P1000") {
      res.status(503).json({
        success: false,
        error: "Database connection error",
        details:
          "Cannot connect to database. Please check DATABASE_URL in .env file.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Internal server error during inventory creation",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /inventory
 * Get all inventory items with their product details
 * Supports query params: category, status (SAFE/LOW/CRITICAL/OUT_OF_STOCK/DEAD_STOCK)
 */
export const getAllInventory = async (
  req: Request<
    {},
    {},
    {},
    { category?: string; status?: string; search?: string }
  >,
  res: Response
): Promise<void> => {
  try {
    const { category, status, search } = req.query;

    // Build where clause
    const where: Record<string, any> = {};

    if (category) {
      where.category = category as string;
    }

    if (search) {
      where.OR = [
        { sku: { contains: search as string, mode: "insensitive" } },
        { name: { contains: search as string, mode: "insensitive" } },
      ];
    }

    // Fetch products with inventory
    const products = await prisma.product.findMany({
      where,
      include: {
        inventory: true,
        supplier: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Calculate status and filter if needed
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    type ProductWithInventory = (typeof products)[0];
    let inventoryItems = products.map((product: ProductWithInventory) => {
      const currentQuantity = product.inventory?.currentQuantity ?? 0;
      const lastSoldAt = product.inventory?.lastSoldAt;

      let itemStatus:
        | "SAFE"
        | "LOW"
        | "CRITICAL"
        | "OUT_OF_STOCK"
        | "DEAD_STOCK";
      if (currentQuantity === 0) {
        itemStatus = "OUT_OF_STOCK";
      } else if (currentQuantity < product.minThreshold * 0.3) {
        itemStatus = "CRITICAL";
      } else if (currentQuantity < product.minThreshold) {
        itemStatus = "LOW";
      } else {
        itemStatus = "SAFE";
      }

      const isDeadStock =
        currentQuantity > 0 && (!lastSoldAt || lastSoldAt < sixtyDaysAgo);

      if (isDeadStock && itemStatus === "SAFE") {
        itemStatus = "DEAD_STOCK";
      }

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        unitCostPrice: product.unitCostPrice,
        unitSellingPrice: product.unitSellingPrice,
        minThreshold: product.minThreshold,
        supplierName: product.supplier.name,
        currentQuantity,
        storageLocation: product.inventory?.storageLocation,
        status: itemStatus,
        isDeadStock,
        lastSoldAt: product.inventory?.lastSoldAt,
        lastRestockedAt: product.inventory?.lastRestockedAt,
      };
    });

    // Filter by status if provided
    if (status) {
      inventoryItems = inventoryItems.filter(
        (item: { status: string }) => item.status === status
      );
    }

    res.status(200).json({
      success: true,
      count: inventoryItems.length,
      data: inventoryItems,
    });
  } catch (error: any) {
    console.error("Error in getAllInventory:", error);

    // Handle Prisma database connection errors
    if (error?.code === "P1001" || error?.code === "P1000") {
      res.status(503).json({
        success: false,
        error: "Database connection error",
        details:
          "Cannot connect to database. Please check DATABASE_URL in .env file.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * PATCH /inventory/:sku
 * Update inventory/product details
 */
export const updateInventory = async (
  req: Request<{ sku: string }, {}, UpdateInventoryRequest>,
  res: Response
): Promise<void> => {
  try {
    const { sku } = req.params;
    const updateData = req.body;

    // Find product
    const product = await prisma.product.findUnique({
      where: { sku },
      include: { inventory: true },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        error: `Product with SKU ${sku} not found`,
      });
      return;
    }

    // Prepare update data
    const productUpdateData: Record<string, any> = {};
    const inventoryUpdateData: Record<string, any> = {};

    if (updateData.name !== undefined)
      productUpdateData.name = updateData.name.trim();
    if (updateData.category !== undefined)
      productUpdateData.category = updateData.category.trim();
    if (updateData.unitCostPrice !== undefined)
      productUpdateData.unitCostPrice = updateData.unitCostPrice;
    if (updateData.unitSellingPrice !== undefined)
      productUpdateData.unitSellingPrice = updateData.unitSellingPrice;
    if (updateData.minThreshold !== undefined)
      productUpdateData.minThreshold = updateData.minThreshold;

    if (updateData.storageLocation !== undefined)
      inventoryUpdateData.storageLocation =
        updateData.storageLocation.trim() || null;
    if (updateData.expiryDate !== undefined)
      inventoryUpdateData.expiryDate = updateData.expiryDate
        ? new Date(updateData.expiryDate)
        : null;
    if (updateData.routineCheckPeriodDays !== undefined)
      inventoryUpdateData.routineCheckPeriodDays =
        updateData.routineCheckPeriodDays || null;
    if (updateData.lastCheckedDate !== undefined)
      inventoryUpdateData.lastCheckedDate = updateData.lastCheckedDate
        ? new Date(updateData.lastCheckedDate)
        : null;

    // Update in transaction
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const updatedProduct = await tx.product.update({
          where: { id: product.id },
          data: productUpdateData,
        });

        let updatedInventory = product.inventory;
        if (product.inventory && Object.keys(inventoryUpdateData).length > 0) {
          updatedInventory = await tx.inventory.update({
            where: { productId: product.id },
            data: inventoryUpdateData,
          });
        } else if (
          !product.inventory &&
          Object.keys(inventoryUpdateData).length > 0
        ) {
          // Create inventory if it doesn't exist
          updatedInventory = await tx.inventory.create({
            data: {
              productId: product.id,
              ...inventoryUpdateData,
            },
          });
        }

        return { product: updatedProduct, inventory: updatedInventory };
      }
    );

    res.status(200).json({
      success: true,
      message: `Product ${result.product.name} (SKU: ${sku}) updated successfully`,
      data: {
        product: {
          id: result.product.id,
          name: result.product.name,
          sku: result.product.sku,
          category: result.product.category,
          unitCostPrice: result.product.unitCostPrice,
          unitSellingPrice: result.product.unitSellingPrice,
          minThreshold: result.product.minThreshold,
        },
        inventory: result.inventory
          ? {
              currentQuantity: result.inventory.currentQuantity,
              storageLocation: result.inventory.storageLocation,
              expiryDate: result.inventory.expiryDate,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error("Error in updateInventory:", error);

    // Handle Prisma database connection errors
    if (error?.code === "P1001" || error?.code === "P1000") {
      res.status(503).json({
        success: false,
        error: "Database connection error",
        details:
          "Cannot connect to database. Please check DATABASE_URL in .env file.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Internal server error during inventory update",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * DELETE /inventory/:sku
 * Stock-Out operation: Sell/dispatch inventory
 *
 * Business Logic:
 * 1. Validates that sufficient stock exists
 * 2. Decrements inventory quantity
 * 3. Updates lastSoldAt timestamp (for dead stock detection)
 * 4. Creates audit log entry for traceability
 *
 * @param req - Express request with sku in params and StockOutRequest in body
 * @param res - Express response
 */
export const deleteInventory = async (
  req: Request<{ sku: string }, {}, StockOutRequest>,
  res: Response
): Promise<void> => {
  try {
    const { sku } = req.params;
    const { sellerName, customerName, quantity, notes } = req.body;

    // Validation
    if (!sellerName || !sellerName.trim()) {
      res.status(400).json({
        success: false,
        error: "sellerName is required for stock-out operations",
      });
      return;
    }

    if (!quantity || quantity <= 0) {
      res.status(400).json({
        success: false,
        error: "quantity must be a positive number",
      });
      return;
    }

    // Find product by SKU
    const product = await prisma.product.findUnique({
      where: { sku },
      include: { inventory: true },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        error: `Product with SKU ${sku} not found`,
      });
      return;
    }

    // Check if inventory record exists
    if (!product.inventory) {
      res.status(404).json({
        success: false,
        error: `Inventory record not found for SKU ${sku}`,
      });
      return;
    }

    const currentQuantity = product.inventory.currentQuantity;

    // Validate sufficient stock
    if (currentQuantity < quantity) {
      res.status(400).json({
        success: false,
        error: `Insufficient stock. Available: ${currentQuantity}, Requested: ${quantity}`,
        availableQuantity: currentQuantity,
      });
      return;
    }

    // Perform stock-out transaction (Atomic operation)
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Update inventory: decrement quantity and update lastSoldAt
        const updatedInventory = await tx.inventory.update({
          where: { productId: product.id },
          data: {
            currentQuantity: {
              decrement: quantity,
            },
            lastSoldAt: new Date(), // Critical for dead stock detection
            updatedAt: new Date(),
          },
        });

        // 2. Create audit log entry (Data Integrity & Traceability)
        const auditLog = await tx.auditLog.create({
          data: {
            sku: product.sku,
            productId: product.id,
            changeAmount: -quantity, // Negative for stock-out
            reason: "Sale",
            sellerName: sellerName.trim(),
            customerName: customerName?.trim(),
            notes: notes?.trim(),
          },
        });

        return {
          inventory: updatedInventory,
          auditLog,
        };
      }
    );

    // Calculate new status based on threshold
    const newQuantity = result.inventory.currentQuantity;
    let status: "SAFE" | "LOW" | "CRITICAL" | "OUT_OF_STOCK";
    if (newQuantity === 0) {
      status = "OUT_OF_STOCK";
    } else if (newQuantity < product.minThreshold * 0.3) {
      status = "CRITICAL";
    } else if (newQuantity < product.minThreshold) {
      status = "LOW";
    } else {
      status = "SAFE";
    }

    res.status(200).json({
      success: true,
      message: `Successfully sold ${quantity} units of SKU ${sku}`,
      data: {
        sku: product.sku,
        productName: product.name,
        previousQuantity: currentQuantity,
        newQuantity: result.inventory.currentQuantity,
        status,
        auditLogId: result.auditLog.id,
        timestamp: result.auditLog.timestamp,
      },
    });
  } catch (error: any) {
    console.error("Error in deleteInventory:", error);

    // Handle Prisma database connection errors
    if (error?.code === "P1001" || error?.code === "P1000") {
      res.status(503).json({
        success: false,
        error: "Database connection error",
        details:
          "Cannot connect to database. Please check DATABASE_URL in .env file.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Internal server error during stock-out operation",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /inventory/:sku/status
 * Get current inventory status including stock level and dead stock flag
 */
export const getInventoryStatus = async (
  req: Request<{ sku: string }>,
  res: Response
): Promise<void> => {
  try {
    const { sku } = req.params;

    const product = await prisma.product.findUnique({
      where: { sku },
      include: { inventory: true },
    });

    if (!product || !product.inventory) {
      res.status(404).json({
        success: false,
        error: `Product or inventory not found for SKU ${sku}`,
      });
      return;
    }

    // Calculate dead stock (60 days threshold)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const lastSoldAt = product.inventory.lastSoldAt;
    const isDeadStock =
      product.inventory.currentQuantity > 0 &&
      (!lastSoldAt || lastSoldAt < sixtyDaysAgo);

    // Determine status
    let status: "SAFE" | "LOW" | "CRITICAL" | "OUT_OF_STOCK";
    const currentQuantity = product.inventory.currentQuantity;
    if (currentQuantity === 0) {
      status = "OUT_OF_STOCK";
    } else if (currentQuantity < product.minThreshold * 0.3) {
      status = "CRITICAL";
    } else if (currentQuantity < product.minThreshold) {
      status = "LOW";
    } else {
      status = "SAFE";
    }

    res.status(200).json({
      success: true,
      data: {
        sku: product.sku,
        productName: product.name,
        currentQuantity: product.inventory.currentQuantity,
        minThreshold: product.minThreshold,
        status,
        isDeadStock,
        lastSoldAt: product.inventory.lastSoldAt,
        storageLocation: product.inventory.storageLocation,
      },
    });
  } catch (error: any) {
    console.error("Error in getInventoryStatus:", error);

    // Handle Prisma database connection errors
    if (error?.code === "P1001" || error?.code === "P1000") {
      res.status(503).json({
        success: false,
        error: "Database connection error",
        details:
          "Cannot connect to database. Please check DATABASE_URL in .env file.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
