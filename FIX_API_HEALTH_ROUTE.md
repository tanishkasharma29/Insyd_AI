# Fix /api/health Route Not Found

## Problem
The `/api/health` route returns "Route not found" even though it's defined in the code.

## Cause
The server is running old code and hasn't been restarted with the latest changes.

## Solution: Restart Server

### Step 1: Stop the Server

**Option A: Using the terminal where server is running**
- Find the terminal where `npm run dev` is running
- Press `Ctrl+C` to stop it

**Option B: Kill all Node processes**
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Step 2: Start the Server Fresh

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📊 Inventory Management API ready
```

### Step 3: Test the Route

In a NEW terminal, run:
```bash
npm run test:api
```

Or test manually:
```bash
curl http://localhost:5000/api/health
```

---

## Verify Route is Loaded

After restarting, you should be able to access:
- `http://localhost:5000/health` - Basic health check
- `http://localhost:5000/api/health` - Health check with DB status

Both should work!

---

## Still Not Working?

If it still doesn't work after restart:

1. **Check the code is saved**: Make sure `src/server.ts` has the `/api/health` route
2. **Check for TypeScript errors**: Look at the server terminal for any errors
3. **Clear and rebuild**:
   ```bash
   Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
   npm run build
   npm run dev
   ```

---

## Quick Restart Command

```powershell
# Stop server
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a moment
Start-Sleep -Seconds 2

# Start server
npm run dev
```

