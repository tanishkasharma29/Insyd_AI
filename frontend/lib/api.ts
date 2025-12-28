import axios from "axios";

// Use relative URL in production (same domain), absolute URL in development
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "/api" : "http://localhost:5000/api");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Types matching backend
export interface DashboardStats {
  totalStockValue: number;
  lowStockCount: number;
  criticalStockCount: number;
  deadStockCount: number;
  deadStockValue: number;
  outOfStockCount: number;
  totalProducts: number;
  totalSKUs: number;
  safeStockCount: number;
}

export interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  currentQuantity: number;
  minThreshold: number;
  unitCostPrice: number;
  unitSellingPrice: number;
  status: "SAFE" | "LOW" | "CRITICAL" | "OUT_OF_STOCK" | "DEAD_STOCK";
  isDeadStock: boolean;
  storageLocation?: string;
  lastSoldAt?: string;
  supplierName?: string;
}

export interface InventoryListResponse {
  success: boolean;
  count: number;
  data: InventoryItem[];
}

export interface CreateInventoryRequest {
  name: string;
  sku: string;
  category: string;
  unitCostPrice: number;
  unitSellingPrice: number;
  supplierId: string;
  minThreshold?: number;
  initialQuantity?: number;
  storageLocation?: string;
}

export interface StockOutRequest {
  sellerName: string;
  customerName?: string;
  quantity: number;
  notes?: string;
}

export interface PendingOrder {
  id: string;
  sku: string;
  productName: string;
  category: string;
  quantity: number;
  expectedDate: string;
  supplierName: string;
  supplierContact?: string;
  unitCostPrice?: number;
  notes?: string;
  createdAt: string;
}

// API Functions
export const api = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get("/dashboard/stats");
    return response.data.data;
  },

  // Inventory
  getInventory: async (params?: {
    category?: string;
    status?: string;
    search?: string;
  }): Promise<InventoryListResponse> => {
    const response = await apiClient.get("/inventory", { params });
    return response.data;
  },

  getInventoryStatus: async (sku: string) => {
    const response = await apiClient.get(`/inventory/${sku}/status`);
    return response.data.data;
  },

  createInventory: async (data: CreateInventoryRequest) => {
    const response = await apiClient.post("/inventory", data);
    return response.data;
  },

  updateInventory: async (
    sku: string,
    data: Partial<CreateInventoryRequest>
  ) => {
    const response = await apiClient.patch(`/inventory/${sku}`, data);
    return response.data;
  },

  stockOut: async (sku: string, data: StockOutRequest) => {
    const response = await apiClient.delete(`/inventory/${sku}`, { data });
    return response.data;
  },

  // Orders
  getPendingOrders: async (): Promise<{
    success: boolean;
    count: number;
    data: PendingOrder[];
  }> => {
    const response = await apiClient.get("/orders/pending");
    return response.data;
  },

  createOrder: async (data: {
    productId: string;
    sku: string;
    quantity: number;
    expectedDate: string;
    supplierId: string;
    unitCostPrice?: number;
    notes?: string;
  }) => {
    const response = await apiClient.post("/orders", data);
    return response.data;
  },

  reconcileOrder: async (
    orderId: string,
    data?: { actualQuantity?: number; notes?: string }
  ) => {
    const response = await apiClient.delete(`/orders/${orderId}`, { data });
    return response.data;
  },
};

export default apiClient;
