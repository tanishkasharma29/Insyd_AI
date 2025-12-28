# Inventory Management System - Backend API

A robust Inventory Management System built with Express.js + TypeScript + Prisma for Indian material businesses.

## Core Features

### 1. Stock-Out (DELETE /api/inventory/:sku)
- Validates sufficient stock before sale
- Decrements inventory quantity atomically
- Updates `lastSoldAt` timestamp (critical for dead stock detection)
- Creates comprehensive audit log entry for traceability
- Returns inventory status (SAFE/LOW/CRITICAL/OUT_OF_STOCK)

### 2. Order Reconciliation (DELETE /api/orders/:id)
- Marks pending orders as RECEIVED
- Automatically increments inventory quantity
- Supports partial fulfillment (actualQuantity parameter)
- Updates `lastRestockedAt` timestamp
- Creates audit log with "Restock" reason
- Atomic transaction ensures data integrity

### 3. Dead Stock Detection
- Products with `lastSoldAt` > 60 days ago are flagged as dead stock
- Integrated into inventory status endpoint

### 4. Low Stock Alerts
- Status calculated based on `minThreshold`
- CRITICAL: < 30% of threshold
- LOW: < threshold
- SAFE: >= threshold

## Database Schema

### Products Table
- Core SKU information (name, category, cost/selling prices)
- `minThreshold`: Reorder level for low stock alerts

### Inventory Table
- Current stock quantity and location
- `lastSoldAt`: For dead stock detection
- `lastRestockedAt`: Last stock-in timestamp

### Audit_Logs Table
- Complete history of all inventory movements
- Records: Sale, Restock, Damage, Return, Adjustment
- Includes seller/vendor/customer names for traceability

### Pending_Orders Table
- Purchase orders before stock arrival
- Status: PENDING → RECEIVED (via reconciliation)
- Supports partial fulfillment

## Setup Instructions

1. **Install Dependencies**
```bash
npm install
```

2. **Setup Database**
   - Create a PostgreSQL database (use Supabase, Neon.tech, or local)
   - Copy `.env.example` to `.env` and update `DATABASE_URL`

3. **Run Prisma Migrations**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. **Start Development Server**
```bash
npm run dev
```

## API Endpoints

### Inventory

- `DELETE /api/inventory/:sku` - Stock-Out operation
  ```json
  {
    "sellerName": "John Doe",
    "customerName": "ABC Constructions",
    "quantity": 10,
    "notes": "Bulk order"
  }
  ```

- `GET /api/inventory/:sku/status` - Get inventory status

### Orders

- `DELETE /api/orders/:id` - Reconcile order (mark as received)
  ```json
  {
    "actualQuantity": 45,
    "notes": "Partial shipment received"
  }
  ```

- `GET /api/orders/pending` - Get all pending orders
- `GET /api/orders/:id` - Get order by ID

## Key Design Decisions

1. **Atomic Transactions**: All stock operations use Prisma transactions to ensure data integrity
2. **Audit Logging**: Every inventory change is logged for complete traceability
3. **Status Calculation**: Real-time status based on thresholds for dashboard integration
4. **Dead Stock Logic**: 60-day threshold based on `lastSoldAt` timestamp
5. **Partial Fulfillment**: Order reconciliation supports receiving less than ordered quantity

## Next Steps

- Implement frontend dashboard (Next.js)
- Add authentication and authorization
- Implement batch operations
- Add reporting endpoints (dead stock report, low stock report)
- Add search and filtering capabilities

