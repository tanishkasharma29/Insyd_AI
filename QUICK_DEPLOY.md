# Quick Deploy to Vercel

## Option 1: Deploy Frontend Only (Recommended First Step)

Since Vercel works best with Next.js apps, deploy the frontend first:

1. **Go to [vercel.com/new](https://vercel.com/new)**
2. **Import your GitHub repository**
3. **Configure Project**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)
   - **Install Command**: `npm install` (auto)

4. **Environment Variables**:
   - `DATABASE_URL`: Your Supabase connection string
   - `NEXT_PUBLIC_API_URL`: (Optional) Your backend API URL if deployed separately

5. **Deploy** - Click "Deploy"

## Option 2: Deploy Both (Monorepo Setup)

### Using Vercel CLI

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Login**:
```bash
vercel login
```

3. **From project root, deploy**:
```bash
vercel
```

4. **Set Environment Variables**:
```bash
vercel env add DATABASE_URL
# Paste your Supabase connection string
# Select: Production, Preview, Development
```

5. **Production Deploy**:
```bash
vercel --prod
```

### Important Notes

- **Backend as Serverless**: The Express backend will run as Vercel serverless functions
- **API Routes**: Backend API will be available at `/api/*`
- **Frontend**: Next.js app will be at root `/`
- **Database**: Must be accessible from Vercel (Supabase works great)

### Alternative: Separate Deployments

If you encounter issues with monorepo setup:

1. **Deploy Frontend** as separate Vercel project (root: `frontend/`)
2. **Deploy Backend** to Render/Railway (as originally planned)
3. **Set `NEXT_PUBLIC_API_URL`** in frontend to point to backend

This is often more reliable and easier to manage.

## Testing After Deployment

1. **Frontend**: Visit `https://your-project.vercel.app`
2. **API Health**: Visit `https://your-project.vercel.app/api/health`
3. **Dashboard**: Visit `https://your-project.vercel.app/api/dashboard/stats`

## Troubleshooting

- **Build fails**: Check build logs in Vercel dashboard
- **API not working**: Check function logs, verify `DATABASE_URL` is set
- **Frontend can't connect**: Ensure API routes are working, check browser console

