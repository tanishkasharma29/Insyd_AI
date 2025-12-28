# Supabase Connection String - Exact Location

## The Exact Path:

1. **Supabase Dashboard** → Your Project
2. **Left Sidebar** → Scroll to bottom → Click **⚙️ Settings**
3. **Settings Page** → Left submenu → Click **"Database"**
4. **Database Page** → Scroll down → Find **"Connection string"** section
5. **Connection string section** → Click **"URI"** tab
6. **Copy** the connection string

---

## Screenshot Description:

When you're in Supabase:

```
┌─────────────────────────────────────────┐
│  Supabase Dashboard                     │
│                                         │
│  ┌──────────┐  ┌────────────────────┐ │
│  │          │  │                    │ │
│  │ Sidebar  │  │  Main Content      │ │
│  │          │  │                    │ │
│  │ Table    │  │                    │ │
│  │ SQL      │  │                    │ │
│  │ Auth     │  │                    │ │
│  │ Storage  │  │                    │ │
│  │ ...      │  │                    │ │
│  │          │  │                    │ │
│  │ ⚙️ Settings│  │                    │ │
│  │          │  │                    │ │
│  └──────────┘  └────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

After clicking Settings:

```
┌─────────────────────────────────────────┐
│  Settings                                │
│                                         │
│  ┌──────────┐  ┌────────────────────┐ │
│  │          │  │                    │ │
│  │ Submenu  │  │  Settings Content  │ │
│  │          │  │                    │ │
│  │ General  │  │                    │ │
│  │ API      │  │                    │ │
│  │ Database │← │  [Database Settings]│ │
│  │ Auth     │  │                    │ │
│  │ Storage  │  │                    │ │
│  │ ...      │  │                    │ │
│  └──────────┘  └────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

In Database Settings, scroll down to see:

```
┌─────────────────────────────────────────┐
│  Database Settings                      │
│                                         │
│  Database password                      │
│  [Reset password button]                │
│                                         │
│  Connection pooling                     │
│  [Settings...]                          │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Connection string                 │ │
│  │                                   │ │
│  │ [URI] [Session] [Transaction]    │ │
│  │                                   │ │
│  │ postgresql://postgres.xxx:...    │ │
│  │                                   │ │
│  │ [Copy] button                     │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

---

## Step-by-Step with Exact Clicks:

1. **Open Supabase**: https://supabase.com/dashboard
2. **Click your project name** (top of page or in project list)
3. **Look at LEFT sidebar** - scroll to the very bottom
4. **Click "Settings"** (gear icon ⚙️) - it's usually the last item
5. **In the NEW left submenu** that appears, click **"Database"**
6. **Scroll down** the Database settings page
7. **Find "Connection string"** section (it's a gray box/panel)
8. **Click the "URI" tab** (first tab in that section)
9. **Click "Copy"** button (or select all and copy manually)

---

## What You're Looking For:

The connection string section will show something like:

```
Connection string
┌─────────────────────────────────────────────┐
│ URI  │  Session mode  │  Transaction mode   │
├─────────────────────────────────────────────┤
│                                               │
│ postgresql://postgres.abcdefghijklmnop:      │
│ [YOUR-PASSWORD]@aws-0-ap-south-1.pooler.     │
│ supabase.com:6543/postgres?pgbouncer=true    │
│                                               │
│                    [Copy]  [Show]            │
└─────────────────────────────────────────────┘
```

---

## Important Notes:

- The connection string has `[YOUR-PASSWORD]` as a placeholder
- You MUST replace it with your actual database password
- Your password is the one you set when creating the project
- If you forgot it, click "Reset database password" in the same page

---

## Quick Alternative Method:

If you can't find it through Settings:

1. Go to your project dashboard
2. Look for **"Connect"** or **"Connection info"** button (sometimes in top right)
3. Or check the **"Getting Started"** section - it often has connection strings

---

## Still Can't Find It?

Try this:

1. Make sure your project is **fully created** (not still "Setting up...")
2. Check you're the **project owner** (not just a collaborator)
3. Try a different browser or clear cache
4. Look for **"Connection pooling"** section - it also has connection info
