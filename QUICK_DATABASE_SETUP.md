# Quick Database Setup - 5 Minutes

## Fastest Way: Supabase (Recommended)

### Step-by-Step:

1. **Go to Supabase**: https://supabase.com

2. **Sign Up** (Free):
   - Click "Start your project"
   - Sign up with GitHub/Google/Email

3. **Create Project**:
   - Click "New Project"
   - Name: `inventory-management`
   - Password: Create a strong password (SAVE IT!)
   - Region: Choose closest to you
   - Click "Create new project"
   - Wait 2-3 minutes

4. **Get Connection String**:
   - Click ⚙️ **Settings** (gear icon, bottom left)
   - Click **Database** (left sidebar)
   - Scroll to **Connection string** section
   - Click **URI** tab
   - You'll see something like:
     ```
     postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-xxx.pooler.supabase.com:6543/postgres
     ```
   - **Click the copy button** to copy it
   - **IMPORTANT**: Replace `[YOUR-PASSWORD]` with your actual password!

5. **Create .env File**:
   - In your project folder (`C:\Users\Dell\Desktop\InsydAI`)
   - Create a new file named `.env` (exactly, with the dot at the start)
   - Add this line (replace with your actual connection string):
     ```env
     DATABASE_URL="postgresql://postgres.xxxxx:YOUR_ACTUAL_PASSWORD@aws-0-xxx.pooler.supabase.com:6543/postgres?pgbouncer=true"
     PORT=5000
     NODE_ENV=development
     ```

6. **Run Setup Commands**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

7. **Restart Server**:
   ```bash
   npm run dev
   ```

8. **Test**:
   ```bash
   npm run test:api
   ```

**Done!** 🎉 Your database is now connected!

---

## Example .env File

Your `.env` file should look like this:

```env
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:MySecurePassword123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
PORT=5000
NODE_ENV=development
```

**Important Notes:**
- ✅ Keep `.env` file safe - never commit it to Git
- ✅ Replace the password placeholder with your actual password
- ✅ The connection string from Supabase is already formatted correctly

---

## Need Help?

If you get stuck:
1. Check the full guide: `DATABASE_SETUP_GUIDE.md`
2. Verify your `.env` file exists and has correct format
3. Make sure you replaced `[YOUR-PASSWORD]` with your actual password
4. Check Supabase project is active (not paused)

