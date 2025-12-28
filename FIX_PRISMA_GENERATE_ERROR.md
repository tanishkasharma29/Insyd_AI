# Fix Prisma Generate Permission Error (EPERM)

## Problem
```
EPERM: operation not permitted, rename '...query_engine-windows.dll.node...'
```

This happens when:
- Server is running and using Prisma client files
- IDE/Editor has files locked
- Windows file permissions issue

## Solution 1: Stop the Server (Recommended)

**If your server is running:**

1. Go to the terminal where `npm run dev` is running
2. Press `Ctrl+C` to stop it
3. Run `npx prisma generate` again

---

## Solution 2: Close All Node Processes

If you can't find the server terminal:

1. **Close all terminals** running Node.js
2. **Open Task Manager** (Ctrl+Shift+Esc)
3. Look for **Node.js** processes
4. **End Task** for all Node.js processes
5. Run `npx prisma generate` again

Or use PowerShell:
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
npx prisma generate
```

---

## Solution 3: Delete Prisma Client Folder

If the above doesn't work:

```bash
# Delete the Prisma client folder
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue

# Then regenerate
npx prisma generate
```

---

## Solution 4: Close IDE/Editor

If you have VS Code or another IDE open:
1. **Close the IDE completely**
2. Run `npx prisma generate`
3. Reopen IDE

---

## Solution 5: Run as Administrator (Last Resort)

1. Right-click PowerShell/Command Prompt
2. Select "Run as Administrator"
3. Navigate to your project: `cd C:\Users\Dell\Desktop\InsydAI`
4. Run `npx prisma generate`

---

## Quick Fix Command

Try this PowerShell command (stops all Node processes):

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force; npx prisma generate
```

---

## After Fixing

Once `npx prisma generate` succeeds:

1. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

2. Start server:
   ```bash
   npm run dev
   ```

