// TypeScript types and interfaces for Inventory Management System

export interface StockOutRequest {
  sellerName: string;
  customerName?: string;
  quantity: number; // How many units to sell
  notes?: string;
}

export interface OrderReconciliationRequest {
  actualQuantity?: number; // If different from ordered quantity (partial fulfillment)
  notes?: string;
}

export interface InventoryStatus {
  sku: string;
  currentQuantity: number;
  minThreshold: number;
  status: "SAFE" | "LOW" | "CRITICAL" | "OUT_OF_STOCK";
  lastSoldAt: Date | null;
  isDeadStock: boolean; // Not sold in last 60 days
}

export interface AuditLogEntry {
  id: string;
  sku: string;
  changeAmount: number;
  reason: string;
  timestamp: Date;
  vendorName?: string;
  sellerName?: string;
  customerName?: string;
  notes?: string;
}

export interface PendingOrder {
  id: string;
  sku: string;
  quantity: number;
  expectedDate: Date;
  status: "PENDING" | "RECEIVED" | "CANCELLED";
  supplierName?: string;
  unitCostPrice?: number;
}

export interface CreateInventoryRequest {
  // Product fields
  name: string;
  sku: string;
  category: string;
  unitCostPrice: number;
  unitSellingPrice: number;
  supplierId: string;
  minThreshold?: number;
  // Inventory fields
  initialQuantity?: number;
  storageLocation?: string;
  expiryDate?: string; // ISO date string
  routineCheckPeriodDays?: number;
}

export interface UpdateInventoryRequest {
  name?: string;
  category?: string;
  unitCostPrice?: number;
  unitSellingPrice?: number;
  minThreshold?: number;
  storageLocation?: string;
  expiryDate?: string; // ISO date string
  routineCheckPeriodDays?: number;
  lastCheckedDate?: string; // ISO date string
}

export interface CreateOrderRequest {
  productId: string;
  sku: string;
  quantity: number;
  expectedDate: string; // ISO date string
  supplierId: string;
  unitCostPrice?: number;
  notes?: string;
}
