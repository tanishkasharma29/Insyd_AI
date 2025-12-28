import { Request, Response } from "express";
import { getPrismaClient } from "../utils/db";

const prisma = getPrismaClient();

/**
 * GET /dashboard/stats
 * Get dashboard statistics:
 * - Total Stock Value (sum of quantity × cost price)
 * - Low Stock Count (items below minThreshold)
 * - Dead Stock Count (items not sold in 60 days)
 */
export const getDashboardStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Calculate dead stock threshold (60 days ago)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Get all products with inventory
    const products = await prisma.product.findMany({
      include: {
        inventory: true,
      },
    });

    // Calculate statistics
    let totalStockValue = 0;
    let lowStockCount = 0;
    let criticalStockCount = 0;
    let deadStockCount = 0;
    let outOfStockCount = 0;
    let totalProducts = products.length;
    let totalSKUs = 0;

    products.forEach((product) => {
      const currentQuantity = product.inventory?.currentQuantity ?? 0;
      const costPrice = Number(product.unitCostPrice);

      // Calculate total stock value
      totalStockValue += currentQuantity * costPrice;

      // Count SKUs with stock
      if (currentQuantity > 0) {
        totalSKUs++;
      }

      // Low stock detection
      if (currentQuantity > 0 && currentQuantity < product.minThreshold) {
        lowStockCount++;
      }

      // Critical stock detection (< 30% of threshold)
      if (currentQuantity > 0 && currentQuantity < product.minThreshold * 0.3) {
        criticalStockCount++;
      }

      // Dead stock detection
      const lastSoldAt = product.inventory?.lastSoldAt;
      const isDeadStock =
        currentQuantity > 0 &&
        (!lastSoldAt || lastSoldAt < sixtyDaysAgo);

      if (isDeadStock) {
        deadStockCount++;
      }

      // Out of stock
      if (currentQuantity === 0) {
        outOfStockCount++;
      }
    });

    // Calculate dead stock value (frozen capital)
    let deadStockValue = 0;
    products.forEach((product) => {
      const currentQuantity = product.inventory?.currentQuantity ?? 0;
      const lastSoldAt = product.inventory?.lastSoldAt;
      const isDeadStock =
        currentQuantity > 0 &&
        (!lastSoldAt || lastSoldAt < sixtyDaysAgo);

      if (isDeadStock) {
        deadStockValue += currentQuantity * Number(product.unitCostPrice);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalStockValue: parseFloat(totalStockValue.toFixed(2)),
        lowStockCount,
        criticalStockCount,
        deadStockCount,
        deadStockValue: parseFloat(deadStockValue.toFixed(2)),
        outOfStockCount,
        totalProducts,
        totalSKUs,
        summary: {
          safeStockCount: totalSKUs - lowStockCount - deadStockCount - outOfStockCount,
        },
      },
    });
  } catch (error: any) {
    console.error("Error in getDashboardStats:", error);
    
    // Handle Prisma database connection errors
    if (error?.code === "P1001" || error?.code === "P1000") {
      res.status(503).json({
        success: false,
        error: "Database connection error",
        details: "Cannot connect to database. Please check DATABASE_URL in .env file and ensure the database is running.",
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

