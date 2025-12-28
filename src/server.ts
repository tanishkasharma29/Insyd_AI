import express, { Express, Request, Response } from "express";
import cors from "cors";
import inventoryRoutes from "./routes/inventory.routes";
import orderRoutes from "./routes/order.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import { testDatabaseConnection } from "./utils/db";

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ 
    status: "ok", 
    message: "Inventory Management API is running",
    timestamp: new Date().toISOString(),
  });
});

// API health check (includes database status)
app.get("/api/health", async (req: Request, res: Response) => {
  try {
    const dbStatus = await testDatabaseConnection();
    
    res.json({
      status: "ok",
      message: "Inventory Management API is running",
      database: dbStatus.connected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
      ...(dbStatus.error && { databaseError: dbStatus.error }),
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      message: "API health check failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// API Routes
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    details: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Inventory Management API ready`);
});

export default app;

