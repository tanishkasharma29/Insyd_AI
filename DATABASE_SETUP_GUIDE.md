# How to Get DATABASE_URL - Complete Guide

## Option 1: Supabase (Recommended - Free & Easy) ⭐

### Steps:

1. **Sign Up**
   - Go to https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub, Google, or email (free)

2. **Create a New Project**
   - Click "New Project"
   - Enter project name: `inventory-management` (or any name)
   - Enter database password (save this!)
   - Select a region (choose closest to you)
   - Click "Create new project"
   - Wait 2-3 minutes for setup

3. **Get Your Connection String**
   - Once project is ready, go to **Project Settings** (gear icon)
   - Click on **Database** in the left sidebar
   - Scroll down to **Connection string** section
   - Select **URI** tab
   - Copy the connection string (it looks like):
     ```
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
   - **IMPORTANT**: Replace `[YOUR-PASSWORD]` with the password you set when creating the project

4. **Create .env File**
   - In your project root, create a file named `.env`
   - Add this line:
     ```env
     DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
     ```
   - Replace `[YOUR-PASSWORD]` with your actual password

### Example:
```env
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:MyPassword123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

---

## Option 2: Neon.tech (Recommended - Free & Fast) ⭐

### Steps:

1. **Sign Up**
   - Go to https://neon.tech
   - Click "Sign Up" (free tier available)
   - Sign up with GitHub or email

2. **Create a New Project**
   - Click "Create Project"
   - Enter project name: `inventory-management`
   - Select PostgreSQL version (default is fine)
   - Click "Create Project"

3. **Get Your Connection String**
   - On the project dashboard, you'll see **Connection string**
   - Click "Copy" button
   - It looks like:
     ```
     postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
     ```

4. **Create .env File**
   - Create `.env` file in project root
   - Add:
     ```env
     DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"
     ```
   - Use the exact string you copied

---

## Option 3: Local PostgreSQL (For Development)

### Prerequisites:
- Install PostgreSQL on your computer
- Download from: https://www.postgresql.org/download/

### Steps:

1. **Install PostgreSQL**
   - Download and install PostgreSQL for Windows
   - During installation, set a password for `postgres` user (remember this!)

2. **Create Database**
   - Open **pgAdmin** (comes with PostgreSQL) or use command line
   - Create a new database called `inventory_db`
   - Or use command line:
     ```bash
     psql -U postgres
     CREATE DATABASE inventory_db;
     \q
     ```

3. **Create .env File**
   - Create `.env` file in project root
   - Add:
     ```env
     DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/inventory_db?schema=public"
     ```
   - Replace `YOUR_PASSWORD` with your PostgreSQL password

---

## Quick Comparison

| Option | Difficulty | Free? | Setup Time | Best For |
|--------|-----------|-------|------------|----------|
| **Supabase** | ⭐ Easy | ✅ Yes | 5 minutes | Beginners, Quick setup |
| **Neon.tech** | ⭐ Easy | ✅ Yes | 5 minutes | Fast, Modern |
| **Local PostgreSQL** | ⭐⭐ Medium | ✅ Yes | 15-30 min | Local development |

---

## After Getting DATABASE_URL

Once you have your `.env` file with `DATABASE_URL`:

### 1. Run Migrations
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 2. Restart Server
```bash
npm run dev
```

### 3. Test
```bash
npm run test:api
```

Now all APIs will work with real database connectivity!

---

## Troubleshooting

### "Connection refused" or "Can't reach database"
- Check your `DATABASE_URL` is correct
- For Supabase/Neon: Make sure you replaced the password placeholder
- For local: Make sure PostgreSQL service is running

### "Authentication failed"
- Check your password is correct
- For Supabase/Neon: Make sure you're using the right connection string format

### "Database does not exist"
- For Supabase/Neon: Database should exist automatically
- For local: Create it manually with `CREATE DATABASE inventory_db;`

---

## Recommendation

**For beginners**: Use **Supabase** - it's the easiest and most reliable free option.

**Quick Start with Supabase:**
1. Go to https://supabase.com
2. Create account
3. Create project
4. Copy connection string
5. Create `.env` file
6. Done! 🎉

