# Quick API Testing Guide

## Step 1: Check if Server Starts

First, let's verify the server compiles and starts:

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📊 Inventory Management API ready
```

If you see errors, fix them first before testing.

---

## Step 2: Basic Tests (No Database Required)

Test endpoints that work without database data:

```bash
npm run test:api
```

This tests:
- ✅ Server health check
- ✅ Dashboard stats (works with empty DB)
- ✅ Get all inventory
- ✅ Error handling (404s, validation)

**Note:** This will work even if your database is empty or not connected.

---

## Step 3: Full Tests (Requires Database)

### A. Setup Database

1. **Create `.env` file** in project root:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/inventory_db?schema=public"
   ```

2. **Run migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Verify Prisma Client:**
   ```bash
   npx prisma generate
   ```

### B. Run Full Tests

Make sure your server is running (`npm run dev`), then:

```bash
npm run test:api:full
```

This will:
- ✅ Create test data automatically
- ✅ Test all CRUD operations
- ✅ Test stock-out and order reconciliation
- ✅ Verify dashboard stats with real data
- ✅ Clean up test data afterwards

---

## Quick Manual Test

If you just want to check if the server responds:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Inventory Management API is running"
}
```

---

## Common Issues

### Server won't start
- Check if port 5000 is available
- Check for TypeScript compilation errors
- Run `npx prisma generate` if Prisma errors

### Database connection errors
- Verify `.env` file exists with correct `DATABASE_URL`
- Check PostgreSQL is running
- Verify database credentials

### Tests fail
- Make sure server is running (`npm run dev`)
- For full tests: ensure database is migrated
- Check console output for specific error messages

