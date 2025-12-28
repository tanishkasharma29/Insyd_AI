# Deployment Guide - Vercel

Complete guide for deploying your Inventory Management System to Vercel.

## 🚀 Recommended Approach: Deploy Frontend to Vercel, Backend to Render

**Why?** This is the most reliable and easiest approach:

- Vercel excels at Next.js frontends
- Render/Railway excel at Express.js backends
- Separate deployments = better scalability and management

### Frontend Deployment (Vercel)

1. **Go to [vercel.com/new](https://vercel.com/new)**
2. **Import your GitHub repository**
3. **Configure Project**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (auto-detected)
   - All other settings: Leave as auto-detected
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Your backend URL (from Render)
   - `DATABASE_URL`: (Optional, only if frontend needs direct DB access)
5. **Deploy** - Click "Deploy"

### Backend Deployment (Render - Recommended)

1. **Go to [render.com](https://render.com)**
2. **New → Web Service**
3. **Connect your GitHub repository**
4. **Configure**:
   - **Name**: `insyd-ai-backend`
   - **Root Directory**: `/` (root)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. **Environment Variables**:
   - `DATABASE_URL`: Your Supabase connection string
   - `PORT`: (Auto-set by Render)
   - `NODE_ENV`: `production`
6. **Deploy**

---

## Alternative: Deploy Both to Vercel (Monorepo)

If you want both on Vercel, you can use this approach, but it's more complex:

### Option A: Two Separate Vercel Projects

1. **Deploy Frontend**:

   - Root Directory: `frontend`
   - Framework: Next.js

2. **Deploy Backend**:

   - Root Directory: `/` (root)
   - Build Command: `npm install && npm run build`
   - Output Directory: (Leave empty)
   - **Create `vercel-backend.json`**:

   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "api/index.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/api/index.ts"
       }
     ]
   }
   ```

   - Rename to `vercel.json` for backend project
   - Set Root Directory to `/` in Vercel dashboard

3. **Update Frontend API URL**:
   - Set `NEXT_PUBLIC_API_URL` to backend Vercel URL

### Option B: Single Vercel Project (Advanced)

This requires more configuration. See the complex setup below.

---

## Quick Start (Recommended: Frontend on Vercel)

### Step 1: Deploy Frontend to Vercel

**Using Web UI:**

1. Visit [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: (auto) `npm run build`
   - **Output Directory**: (auto) `.next`
   - **Install Command**: (auto) `npm install`
4. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `http://localhost:5000/api` (for local testing)
   - Later update to your backend URL after deploying backend
5. Click **Deploy**

**Using CLI:**

```bash
cd frontend
npm i -g vercel
vercel login
vercel
# Follow prompts, set root directory to current directory
```

### Step 2: Deploy Backend to Render (Recommended)

1. **Sign up at [render.com](https://render.com)**
2. **New → Web Service**
3. **Connect GitHub** and select your repository
4. **Configure**:
   ```
   Name: insyd-ai-api
   Environment: Node
   Region: (Choose closest)
   Branch: main
   Root Directory: /
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```
5. **Environment Variables**:
   ```
   DATABASE_URL=your-supabase-connection-string
   NODE_ENV=production
   ```
6. **Deploy**

### Step 3: Update Frontend API URL

1. Go to Vercel Dashboard → Your Frontend Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` to your Render backend URL:
   ```
   NEXT_PUBLIC_API_URL=https://insyd-ai-api.onrender.com/api
   ```
3. Redeploy frontend (or wait for auto-deploy)

---

## Environment Variables Reference

### Frontend (Vercel)

| Variable              | Description     | Example                                 |
| --------------------- | --------------- | --------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://your-backend.onrender.com/api` |

### Backend (Render/Vercel)

| Variable       | Description                      | Example                               |
| -------------- | -------------------------------- | ------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string     | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV`     | Environment                      | `production`                          |
| `PORT`         | Server port (auto-set on Render) | `5000`                                |

---

## Database Migrations

After deploying, run migrations on production database:

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy
```

Or use Prisma Studio to verify schema:

```bash
npx prisma studio
```

---

## Testing Your Deployment

1. **Frontend**: `https://your-frontend.vercel.app`
2. **Backend Health**: `https://your-backend.onrender.com/api/health`
3. **API Test**: `https://your-backend.onrender.com/api/dashboard/stats`

---

## Troubleshooting

### Frontend Can't Connect to Backend

- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend is deployed and accessible
- Check browser console for CORS errors
- Ensure backend CORS allows your frontend domain

### Backend API Not Working

- Check Render/Vercel logs
- Verify `DATABASE_URL` is set correctly
- Check Prisma client generation (should happen in postinstall)
- Verify database is accessible from deployment platform

### Database Connection Issues

- Ensure Supabase allows connections from Render/Vercel IPs
- Check connection string format
- Verify database exists and migrations are run
- Test connection string locally first

### Build Failures

- Check build logs in deployment platform
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation succeeds locally first
- Check for missing environment variables

---

## Production Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render (or Vercel)
- [ ] `DATABASE_URL` set in backend environment
- [ ] `NEXT_PUBLIC_API_URL` set in frontend environment
- [ ] Database migrations run on production DB
- [ ] Frontend connects to backend API
- [ ] All API endpoints tested
- [ ] Error handling verified
- [ ] CORS configured correctly

---

## Cost Considerations

- **Vercel (Frontend)**: Free tier available, generous limits
- **Render (Backend)**: Free tier available (with limitations)
- **Supabase (Database)**: Free tier available

---

## Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Prisma Docs**: [prisma.io/docs](https://www.prisma.io/docs)
