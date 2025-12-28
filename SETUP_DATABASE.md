# Database Setup Guide

## Quick Fix for "Internal Server Error"

The APIs are returning "Internal server error" because **the database is not configured**.

## Step 1: Create .env File

Create a `.env` file in the project root:

```bash
# Copy the example file
copy .env.example .env
```

Or manually create `.env` with:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/inventory_db?schema=public"
PORT=5000
NODE_ENV=development
```

## Step 2: Get a Database

You have three options:

### Option A: Local PostgreSQL
1. Install PostgreSQL on your machine
2. Create a database: `CREATE DATABASE inventory_db;`
3. Update `.env` with your credentials

### Option B: Supabase (Recommended - Free)
1. Go to https://supabase.com
2. Create a free account
3. Create a new project
4. Go to Project Settings → Database
5. Copy the connection string
6. Update `.env` with the connection string

### Option C: Neon.tech (Recommended - Free)
1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Update `.env` with the connection string

## Step 3: Run Migrations

After setting up `.env`:

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

## Step 4: Restart Server

Stop your server (Ctrl+C) and restart:

```bash
npm run dev
```

## Step 5: Test Again

Now run the tests:

```bash
npm run test:api
```

## Verification

You can check if the database is connected by visiting:

```
http://localhost:5000/api/health
```

This will show database connection status.

## Still Having Issues?

1. Check your `.env` file exists
2. Verify `DATABASE_URL` is correct
3. Test database connection: `npx prisma db pull`
4. Check Prisma Client is generated: `npx prisma generate`

