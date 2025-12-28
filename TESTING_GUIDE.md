# API Testing Guide

This guide explains how to test all the backend APIs to ensure they're working correctly.

## Prerequisites

1. **Database Setup**
   - Create a PostgreSQL database (local, Supabase, or Neon.tech)
   - Create a `.env` file with your `DATABASE_URL`:
     ```
     DATABASE_URL="postgresql://user:password@localhost:5432/inventory_db?schema=public"
     ```

2. **Run Database Migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Start the Backend Server**
   ```bash
   npm run dev
   ```
   The server should start on port 5000 (or PORT from .env)

## Testing Methods

### Method 1: Basic API Tests (No Database Required)

This script tests endpoints that don't require pre-existing data:

```bash
npm run test:api
```

**What it tests:**
- Health check endpoint
- Dashboard stats (works with empty database)
- Get all inventory (empty list is OK)
- Inventory filters
- Get pending orders
- Error handling (404s, validation errors)

**Limitations:** Cannot test full CRUD operations without test data.

---

### Method 2: Full API Tests (Requires Database)

This script creates test data and tests all CRUD operations:

```bash
npm run test:api:full
```

**What it tests:**
1. ✅ Health check
2. ✅ Create inventory (POST /inventory)
3. ✅ Get inventory status
4. ✅ Get all inventory
5. ✅ Update inventory (PATCH /inventory/:sku)
6. ✅ Create order (POST /orders)
7. ✅ Get pending orders
8. ✅ Get order by ID
9. ✅ Stock-Out (DELETE /inventory/:sku)
10. ✅ Reconcile order (DELETE /orders/:id)
11. ✅ Dashboard stats
12. ✅ Final inventory verification

**Features:**
- Automatically creates test supplier and products
- Tests all operations end-to-end
- Cleans up test data after completion
- Provides detailed test results

---

### Method 3: Manual Testing with curl

#### Health Check
```bash
curl http://localhost:5000/health
```

#### Get Dashboard Stats
```bash
curl http://localhost:5000/api/dashboard/stats
```

#### Get All Inventory
```bash
curl http://localhost:5000/api/inventory
```

#### Create Inventory (requires supplier ID)
```bash
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "sku": "TEST-001",
    "category": "flooring",
    "unitCostPrice": 500,
    "unitSellingPrice": 750,
    "supplierId": "YOUR_SUPPLIER_ID",
    "minThreshold": 50,
    "initialQuantity": 100
  }'
```

#### Get Inventory Status
```bash
curl http://localhost:5000/api/inventory/TEST-001/status
```

#### Stock-Out (Sell Inventory)
```bash
curl -X DELETE http://localhost:5000/api/inventory/TEST-001 \
  -H "Content-Type: application/json" \
  -d '{
    "sellerName": "John Doe",
    "customerName": "ABC Construction",
    "quantity": 20,
    "notes": "Bulk order"
  }'
```

---

### Method 4: Using Postman or Thunder Client

1. **Import Collection** (if available) or create requests manually

2. **Base URL**: `http://localhost:5000/api`

3. **Endpoints to test:**
   - `GET /health`
   - `GET /dashboard/stats`
   - `GET /inventory`
   - `GET /inventory?category=flooring&status=LOW`
   - `POST /inventory` (requires supplier)
   - `GET /inventory/:sku/status`
   - `PATCH /inventory/:sku`
   - `DELETE /inventory/:sku` (stock-out)
   - `GET /orders/pending`
   - `POST /orders`
   - `GET /orders/:id`
   - `DELETE /orders/:id` (reconcile)

---

### Method 5: Using Prisma Studio (Database Inspection)

To inspect and manually add test data:

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can:
- View all tables
- Add/edit/delete records
- Create suppliers, products, inventory, etc.

---

## Expected Test Results

### Successful Test Run

```
========================================
  Full API Test Suite
========================================

✓ PASS - Health Check
✓ PASS - POST /inventory
✓ PASS - GET /inventory/:sku/status
✓ PASS - GET /inventory
✓ PASS - PATCH /inventory/:sku
✓ PASS - POST /orders
✓ PASS - GET /orders/pending
✓ PASS - GET /orders/:id
✓ PASS - DELETE /inventory/:sku (Stock-Out)
✓ PASS - DELETE /orders/:id (Reconcile)
✓ PASS - GET /dashboard/stats
✓ PASS - Final Inventory Status

========================================
  Test Summary
========================================
Passed: 12
Failed: 0
Total: 12

✓ All tests passed! Backend API is working correctly.
```

---

## Troubleshooting

### Error: "Cannot find module '@prisma/client'"
**Solution:** Run `npx prisma generate`

### Error: "P1001: Can't reach database server"
**Solution:** 
- Check your `.env` file has correct `DATABASE_URL`
- Ensure PostgreSQL is running
- Verify database credentials

### Error: "P3005: Database schema is not empty"
**Solution:** Either:
- Delete existing tables, or
- Run `npx prisma migrate reset` (⚠️ deletes all data)

### Error: "ECONNREFUSED" when running tests
**Solution:** Make sure the backend server is running (`npm run dev`)

### Tests fail with 404 errors
**Solution:** 
- Check that Prisma migrations have been run
- Verify the database has the correct schema
- Check that test data is being created properly

---

## Next Steps

After successful testing:
1. ✅ Backend API is verified and working
2. 🔄 Proceed to build the Next.js frontend
3. 🔄 Implement authentication (if needed)
4. 🔄 Deploy to production

---

## API Endpoints Summary

| Method | Endpoint | Description | Status Code |
|--------|----------|-------------|-------------|
| GET | `/health` | Health check | 200 |
| GET | `/api/dashboard/stats` | Dashboard statistics | 200 |
| GET | `/api/inventory` | List all inventory | 200 |
| GET | `/api/inventory/:sku/status` | Get inventory status | 200/404 |
| POST | `/api/inventory` | Create new inventory | 201/400/404 |
| PATCH | `/api/inventory/:sku` | Update inventory | 200/404 |
| DELETE | `/api/inventory/:sku` | Stock-out (sell) | 200/400/404 |
| GET | `/api/orders/pending` | List pending orders | 200 |
| GET | `/api/orders/:id` | Get order details | 200/404 |
| POST | `/api/orders` | Create purchase order | 201/400/404 |
| DELETE | `/api/orders/:id` | Reconcile order | 200/400/404 |

