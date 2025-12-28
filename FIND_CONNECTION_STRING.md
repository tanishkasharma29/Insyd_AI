# How to Find Connection String in Supabase - Step by Step

## Detailed Navigation Steps

### Step 1: Log into Supabase
- Go to https://supabase.com
- Click "Sign In" (top right)
- Enter your credentials

### Step 2: Select Your Project
- After logging in, you'll see your project dashboard
- Click on your project name (the one you created, e.g., "inventory-management")

### Step 3: Open Project Settings
- Look at the **left sidebar** (vertical menu on the left side)
- Scroll down if needed
- Find and click on **⚙️ Settings** (gear icon)
- It's usually at the bottom of the sidebar menu

### Step 4: Navigate to Database Settings
- In the Settings page, you'll see a **left submenu** with options like:
  - General
  - API
  - **Database** ← Click this one!
  - Auth
  - Storage
  - etc.
- Click on **"Database"** in this submenu

### Step 5: Find Connection String Section
- Scroll down the Database settings page
- You'll see several sections:
  - Database password
  - Connection pooling
  - **Connection string** ← This is what you need!
- Look for a section titled **"Connection string"** or **"Connection info"**

### Step 6: Select URI Tab
- In the Connection string section, you'll see tabs:
  - **URI** ← Click this tab
  - Session mode
  - Transaction mode
- Click on the **"URI"** tab

### Step 7: Copy the Connection String
- You'll see a connection string that looks like:
  ```
  postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
  ```
- Click the **"Copy"** button (usually a copy icon or button next to the string)
- Or manually select and copy the entire string

### Step 8: Replace Password Placeholder
- The copied string will have `[YOUR-PASSWORD]` as a placeholder
- Replace `[YOUR-PASSWORD]` with the **actual password** you set when creating the project
- If you forgot the password, you can reset it in the same Database settings page

---

## Visual Guide (Text-Based)

```
Supabase Dashboard
├── Left Sidebar
│   ├── Table Editor
│   ├── SQL Editor
│   ├── Authentication
│   ├── Storage
│   ├── ...
│   └── ⚙️ Settings ← Click here
│       └── Settings Page Opens
│           ├── Left Submenu
│           │   ├── General
│           │   ├── API
│           │   ├── Database ← Click here
│           │   ├── Auth
│           │   └── ...
│           └── Database Settings Page
│               └── Scroll Down
│                   └── Connection string section
│                       └── URI tab ← Click here
│                           └── Copy the string
```

---

## Alternative: Direct URL

If you're already in your project, you can go directly to:
```
https://supabase.com/dashboard/project/[YOUR-PROJECT-ID]/settings/database
```

Replace `[YOUR-PROJECT-ID]` with your actual project ID (you can see it in the URL when you're in your project).

---

## What the Connection String Looks Like

**Before replacing password:**
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**After replacing password (example):**
```
postgresql://postgres.abcdefghijklmnop:MySecurePassword123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## If You Can't Find It

1. **Check you're in the right project**: Make sure you selected your project from the dashboard
2. **Check you're in Settings**: Look for the gear icon (⚙️) in the left sidebar
3. **Check Database submenu**: In Settings, make sure you clicked "Database" in the left submenu
4. **Scroll down**: The Connection string section might be further down the page
5. **Try refreshing**: Sometimes the page needs a refresh

---

## Quick Checklist

- [ ] Logged into Supabase
- [ ] Selected your project
- [ ] Clicked ⚙️ Settings (left sidebar)
- [ ] Clicked "Database" (left submenu in Settings)
- [ ] Scrolled to "Connection string" section
- [ ] Clicked "URI" tab
- [ ] Copied the connection string
- [ ] Replaced `[YOUR-PASSWORD]` with actual password

---

## Still Having Trouble?

If you still can't find it:
1. Make sure your project is fully created (not still setting up)
2. Check if you have the right permissions (you need to be the project owner)
3. Try the alternative: Use the "Connection pooling" section - it also has connection strings

