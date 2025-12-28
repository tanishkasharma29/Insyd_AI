# API Documentation - Inventory Management System

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently, no authentication is required. In production, implement JWT or API keys.

---

## Inventory Endpoints

### 1. Stock-Out (Sell/Dispatch Inventory)

**DELETE** `/inventory/:sku`

Marks inventory as sold/dispatched. This operation:
- Validates sufficient stock exists
- Decrements inventory quantity atomically
- Updates `lastSoldAt` timestamp (critical for dead stock detection)
- Creates comprehensive audit log entry

#### Request
```http
DELETE /api/inventory/TILE-MARBLE-001
Content-Type: application/json

{
  "sellerName": "Rajesh Kumar",
  "customerName": "ABC Constructions",
  "quantity": 50,
  "notes": "Bulk order for new project"
}
```

#### Response (Success - 200)
```json
{
  "success": true,
  "message": "Successfully sold 50 units of SKU TILE-MARBLE-001",
  "data": {
    "sku": "TILE-MARBLE-001",
    "productName": "Premium Marble Tiles",
    "previousQuantity": 150,
    "newQuantity": 100,
    "status": "SAFE",
    "auditLogId": "uuid-here",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Response (Insufficient Stock - 400)
```json
{
  "success": false,
  "error": "Insufficient stock. Available: 30, Requested: 50",
  "availableQuantity": 30
}
```

#### Response (Product Not Found - 404)
```json
{
  "success": false,
  "error": "Product with SKU TILE-MARBLE-001 not found"
}
```

---

### 2. Get Inventory Status

**GET** `/inventory/:sku/status`

Retrieves current inventory status including dead stock flag and stock level.

#### Request
```http
GET /api/inventory/TILE-MARBLE-001/status
```

#### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "sku": "TILE-MARBLE-001",
    "productName": "Premium Marble Tiles",
    "currentQuantity": 100,
    "minThreshold": 50,
    "status": "SAFE",
    "isDeadStock": false,
    "lastSoldAt": "2024-01-15T10:30:00.000Z",
    "storageLocation": "Warehouse A, Aisle 4"
  }
}
```

#### Status Values
- `SAFE`: Quantity >= minThreshold
- `LOW`: Quantity < minThreshold but >= 30% of threshold
- `CRITICAL`: Quantity < 30% of minThreshold
- `OUT_OF_STOCK`: Quantity = 0

#### Dead Stock Logic
A product is flagged as `isDeadStock: true` if:
- Current quantity > 0
- `lastSoldAt` is null OR > 60 days ago

---

## Order Endpoints

### 3. Reconcile Order (Mark as Received)

**DELETE** `/orders/:id`

Marks a pending order as received and automatically increments inventory. This is the **Order-to-Inventory Sync** feature.

**Business Logic:**
1. Validates order is in PENDING status
2. Creates or updates inventory record (increments quantity)
3. Updates `lastRestockedAt` timestamp
4. Creates audit log entry with reason "Restock"
5. Marks order as RECEIVED with `receivedAt` timestamp
6. Supports partial fulfillment (if `actualQuantity` differs from ordered quantity)

#### Request (Full Fulfillment)
```http
DELETE /api/orders/order-uuid-123
Content-Type: application/json

{}
```

#### Request (Partial Fulfillment)
```http
DELETE /api/orders/order-uuid-123
Content-Type: application/json

{
  "actualQuantity": 45,
  "notes": "Partial shipment received. Remaining 5 units expected next week"
}
```

#### Response (Success - 200)
```json
{
  "success": true,
  "message": "Order order-uuid-123 reconciled successfully. Stock updated for SKU TILE-MARBLE-001",
  "data": {
    "orderId": "order-uuid-123",
    "sku": "TILE-MARBLE-001",
    "productName": "Premium Marble Tiles",
    "quantityAdded": 50,
    "orderedQuantity": 50,
    "wasPartialFulfillment": false,
    "inventory": {
      "previousQuantity": 100,
      "newQuantity": 150,
      "status": "SAFE"
    },
    "auditLogId": "audit-uuid-456",
    "receivedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

#### Response (Order Not Found - 404)
```json
{
  "success": false,
  "error": "Pending order with ID order-uuid-123 not found"
}
```

#### Response (Order Already Processed - 400)
```json
{
  "success": false,
  "error": "Order is already RECEIVED. Cannot reconcile.",
  "currentStatus": "RECEIVED"
}
```

---

### 4. Get Pending Orders

**GET** `/orders/pending`

Retrieves all orders with status "PENDING", ordered by expected date (soonest first).

#### Request
```http
GET /api/orders/pending
```

#### Response (Success - 200)
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "order-uuid-123",
      "sku": "TILE-MARBLE-001",
      "productName": "Premium Marble Tiles",
      "category": "flooring",
      "quantity": 50,
      "expectedDate": "2024-01-20T00:00:00.000Z",
      "supplierName": "Marble Suppliers Ltd",
      "supplierContact": "+91-9876543210",
      "unitCostPrice": 450.00,
      "notes": null,
      "createdAt": "2024-01-10T09:00:00.000Z"
    }
  ]
}
```

---

### 5. Get Order by ID

**GET** `/orders/:id`

Retrieves detailed information about a specific order.

#### Request
```http
GET /api/orders/order-uuid-123
```

#### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "id": "order-uuid-123",
    "sku": "TILE-MARBLE-001",
    "product": {
      "name": "Premium Marble Tiles",
      "category": "flooring",
      "currentStock": 100,
      "minThreshold": 50
    },
    "quantity": 50,
    "expectedDate": "2024-01-20T00:00:00.000Z",
    "status": "PENDING",
    "supplier": {
      "name": "Marble Suppliers Ltd",
      "contact": "+91-9876543210",
      "email": "contact@marblesuppliers.com"
    },
    "unitCostPrice": 450.00,
    "notes": null,
    "createdAt": "2024-01-10T09:00:00.000Z",
    "receivedAt": null
  }
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message here",
  "details": "Additional error details (in development mode)"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid input or business rule violation
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

---

## Database Schema Overview

### Products Table
- Core SKU information (name, category, prices)
- `minThreshold`: Reorder level for low stock alerts

### Inventory Table
- Current stock quantity and location
- `lastSoldAt`: For dead stock detection (60-day threshold)
- `lastRestockedAt`: Last stock-in timestamp

### Audit_Logs Table
- Complete history of all inventory movements
- Records: Sale, Restock, Damage, Return, Adjustment
- Includes seller/vendor/customer names for traceability

### Pending_Orders Table
- Purchase orders before stock arrival
- Status: PENDING → RECEIVED (via reconciliation)
- Supports partial fulfillment

---

## Key Features Demonstrated

### 1. Data Integrity
- All stock operations use **atomic transactions**
- Prevents race conditions and data inconsistencies
- Ensures inventory counts are always accurate

### 2. Audit Trail
- Every inventory change is logged
- Complete traceability (who, when, why, what)
- Solves "ghost inventory" problem

### 3. Dead Stock Detection
- Automatic flagging of products not sold in 60 days
- Helps identify frozen capital
- Enables proactive liquidation strategies

### 4. Low Stock Alerts
- Real-time status calculation
- CRITICAL/LOW/SAFE/OUT_OF_STOCK classification
- Prevents stockouts of fast-moving items

### 5. Order-to-Inventory Sync
- Seamless integration between purchase orders and inventory
- Supports partial fulfillment
- Automatically updates stock levels

