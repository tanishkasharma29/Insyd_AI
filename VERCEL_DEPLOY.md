# Deploy Complete Project to Vercel

This guide will help you deploy both frontend and backend to Vercel as a single project.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: All code pushed to GitHub
3. **Supabase Database**: PostgreSQL database with connection string ready

## Quick Deployment Steps

### Option 1: Using Vercel Dashboard (Recommended)

1. **Go to [vercel.com/new](https://vercel.com/new)**

2. **Import Your Repository**:
   - Click "Import Git Repository"
   - Select your GitHub repository: `tanishkasharma29/Insyd_AI`
   - Click "Import"

3. **Configure Project**:
   - **Project Name**: `insyd-ai` (or your preferred name)
   - **Framework Preset**: Other (we'll use custom configuration)
   - **Root Directory**: `./` (root)
   - **Build Command**: Leave empty (Vercel will use vercel.json)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`
   - **Development Command**: Leave empty

4. **Environment Variables**:
   Click "Environment Variables" and add:
   
   | Name | Value | Environments |
   |------|-------|--------------|
   | `DATABASE_URL` | Your Supabase PostgreSQL connection string | Production, Preview, Development |

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete (this may take 2-5 minutes)

6. **Verify Deployment**:
   After deployment completes, you'll get URLs like:
   - **Production**: `https://your-project.vercel.app`
   - **Frontend**: `https://your-project.vercel.app` (root)
   - **Backend API**: `https://your-project.vercel.app/api/health`

### Option 2: Using Vercel CLI

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Login**:
```bash
vercel login
```

3. **Deploy** (from project root):
```bash
vercel
```

4. **Follow Prompts**:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No** (first time)
   - What's your project's name? `insyd-ai`
   - In which directory is your code located? `./`
   - Override settings? **No**

5. **Set Environment Variable**:
```bash
vercel env add DATABASE_URL
# Paste your Supabase connection string
# Select: Production, Preview, Development (all three)
```

6. **Deploy to Production**:
```bash
vercel --prod
```

## Project Structure on Vercel

```
your-project.vercel.app/
├── /                    → Frontend (Next.js app)
├── /api/*               → Backend API (Express serverless functions)
└── /health              → Backend health check
```

## How It Works

1. **Frontend Routes** (`/`): 
   - Handled by Next.js app in `frontend/` directory
   - All routes except `/api/*` go to frontend

2. **Backend Routes** (`/api/*`):
   - Handled by Express app via `api/index.ts`
   - Routes like `/api/inventory`, `/api/orders`, etc.
   - Runs as Vercel serverless functions

3. **Routing Configuration**:
   - Defined in `vercel.json`
   - API routes → `/api/index.ts` (serverless function)
   - All other routes → Frontend Next.js app

## Verify Deployment

After deployment, test these URLs:

1. **Frontend Dashboard**:
   ```
   https://your-project.vercel.app
   ```

2. **Backend Health Check**:
   ```
   https://your-project.vercel.app/api/health
   ```

3. **Dashboard Stats API**:
   ```
   https://your-project.vercel.app/api/dashboard/stats
   ```

4. **Inventory API**:
   ```
   https://your-project.vercel.app/api/inventory
   ```

## Environment Variables

Make sure these are set in Vercel Dashboard → Settings → Environment Variables:

- **`DATABASE_URL`**: Your Supabase PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database`
  - Set for: Production, Preview, Development

## Run Database Migrations

Before using the app, ensure your production database has the schema:

1. **Set DATABASE_URL locally** (optional, for local migration):
```bash
export DATABASE_URL="your-production-database-url"
```

2. **Run migrations**:
```bash
npx prisma migrate deploy
```

Or use Prisma Studio to verify:
```bash
npx prisma studio
```

## Troubleshooting

### Build Fails

**Check Build Logs**:
- Vercel Dashboard → Deployments → Click deployment → View Build Logs
- Look for errors in the logs

**Common Issues**:
- Missing dependencies: Check `package.json` includes all packages
- TypeScript errors: Run `npm run build` locally first
- Prisma generation: Should happen automatically via `postinstall` script

### Backend API Not Working

**Check Function Logs**:
- Vercel Dashboard → Functions → Click function → View Logs

**Common Issues**:
- `DATABASE_URL` not set: Add it in Environment Variables
- Prisma client not generated: Check `postinstall` script runs
- Database connection: Verify connection string is correct

### Frontend Can't Connect to Backend

**Check Browser Console**:
- Open DevTools → Console
- Look for API request errors

**Common Issues**:
- API routes not accessible: Check `vercel.json` routing
- CORS errors: Backend should allow all origins (already configured)
- Network errors: Verify backend is deployed and accessible

### Database Connection Errors

**Verify Connection**:
- Check `DATABASE_URL` is set correctly in Vercel
- Test connection string locally first
- Ensure Supabase allows connections from Vercel IPs
- Check Supabase dashboard for connection status

## Updating Your Deployment

### Automatic Updates

Vercel automatically deploys when you push to GitHub:
```bash
git add .
git commit -m "Update code"
git push origin main
```

### Manual Deployment

```bash
vercel --prod
```

### Update Environment Variables

1. Vercel Dashboard → Settings → Environment Variables
2. Edit or add variables
3. Redeploy (or wait for auto-deploy)

## Performance Tips

1. **Cold Starts**: First request after inactivity may be slow
   - Vercel Pro plan reduces cold starts
   - Functions warm up after first request

2. **Database Connections**: 
   - Prisma Client is generated on each deployment
   - Connection pooling handled automatically

3. **Caching**:
   - Frontend uses Next.js caching
   - API responses can be cached at CDN level

## Production Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created and linked
- [ ] `DATABASE_URL` environment variable set
- [ ] Deployment successful (no build errors)
- [ ] Frontend loads at root URL
- [ ] Backend API responds at `/api/health`
- [ ] Database migrations run on production DB
- [ ] All API endpoints tested
- [ ] Frontend can fetch data from backend

## Cost

- **Vercel Hobby Plan**: Free tier available
  - 100GB bandwidth/month
  - Serverless functions included
  - Perfect for MVP and testing

- **Upgrade to Pro**: If you need more resources
  - Better performance
  - More bandwidth
  - Team collaboration

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Build Logs**: Check in Vercel Dashboard for errors

## Next Steps After Deployment

1. **Test All Features**: Make sure everything works
2. **Add Custom Domain**: Vercel Dashboard → Settings → Domains
3. **Set Up Monitoring**: Enable Vercel Analytics
4. **Add Error Tracking**: Consider Sentry for production errors
5. **Performance Monitoring**: Use Vercel Analytics dashboard

Your complete application is now live! 🎉

