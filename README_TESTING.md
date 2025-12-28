# Quick Testing Instructions

## The Issue
Your tests are failing because **the backend server is not running**. The tests need an active server to connect to.

## Solution: Two Terminal Setup

You need **two terminal windows**:

### Terminal 1: Start the Server
```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📊 Inventory Management API ready
```

**Keep this terminal running!** Don't close it.

---

### Terminal 2: Run Tests

Once the server is running, in a **new terminal window**, run:

```bash
npm run test:api
```

Or for full tests with database:
```bash
npm run test:api:full
```

---

## Quick Check Script

To check if your server is running without starting tests:

```bash
npm run check:server
```

---

## Summary

1. ✅ **Terminal 1**: `npm run dev` (keep running)
2. ✅ **Terminal 2**: `npm run test:api` (run tests)

That's it! The tests will now connect to your running server.

