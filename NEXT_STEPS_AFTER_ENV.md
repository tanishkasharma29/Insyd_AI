# Next Steps After Adding DATABASE_URL

## Step 1: Generate Prisma Client
This creates the TypeScript types for your database:

```bash
npx prisma generate
```

**Expected output:**
```
✔ Generated Prisma Client (v5.x.x) to .\node_modules\@prisma\client
```

---

## Step 2: Run Database Migrations
This creates all the tables in your database:

```bash
npx prisma migrate dev --name init
```

**Expected output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public" at "xxx.supabase.com:6543"

✔ Created migration `20240101_init` as migration.sql
Applying migration `20240101_init`
✔ Applied migration `20240101_init`

The following migration(s) have been created and applied from new schema changes:

  prisma/migrations/20240101_init/migration.sql
```

**Note:** If this is your first migration, it will create all tables (products, inventory, audit_logs, pending_orders, suppliers).

---

## Step 3: Verify Database Connection
Optional - Check if everything is working:

```bash
npm run check:server
```

Or visit: http://localhost:5000/api/health

---

## Step 4: Restart Your Server
Stop your current server (if running) and restart:

```bash
npm run dev
```

**Expected output:**
```
🚀 Server running on port 5000
📊 Inventory Management API ready
```

---

## Step 5: Test All APIs
Run the test suite:

```bash
npm run test:api
```

**Expected result:**
- All 11 tests should pass! ✅
- Database status should show "connected"
- APIs should work with real database

---

## Step 6 (Optional): Run Full Tests with Data
For complete end-to-end testing:

```bash
npm run test:api:full
```

This will:
- Create test data
- Test all CRUD operations
- Clean up test data afterward

---

## Troubleshooting

### Error: "Environment variable not found: DATABASE_URL"
- Make sure `.env` file is in project root (same folder as `package.json`)
- Make sure `.env` file has `DATABASE_URL="..."` (with quotes)

### Error: "Can't reach database server"
- Check your connection string is correct
- Verify you replaced `[YOUR-PASSWORD]` with actual password
- Check Supabase project is active (not paused)

### Error: "Authentication failed"
- Double-check your database password is correct
- Make sure password is properly set in connection string

### Error: "Migration failed"
- Check database connection is working
- Try: `npx prisma db push` as alternative
- Check Prisma logs for specific error

---

## Success Checklist

After completing these steps, you should have:

- ✅ `.env` file with `DATABASE_URL`
- ✅ Prisma Client generated
- ✅ Database tables created
- ✅ Server running on port 5000
- ✅ All APIs responding correctly
- ✅ Database status showing "connected"

---

## You're Ready!

Once all steps are complete, your Inventory Management System backend is fully operational! 🎉

You can now:
- Create inventory items
- Manage orders
- Track stock levels
- View dashboard statistics
- Build the frontend!

