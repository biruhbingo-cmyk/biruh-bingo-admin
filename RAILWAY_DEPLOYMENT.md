# Railway Deployment Guide

This guide will help you deploy your Next.js admin dashboard to Railway.

## Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app))
2. Your GitHub repository connected to Railway
3. Your backend API deployed and accessible (or the production URL)

## Step-by-Step Deployment

### 1. Connect Your Repository to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: `yonatannnn/winner-bingo-admin`
5. Railway will automatically detect it's a Next.js project

### 2. Configure Environment Variables

Railway will automatically start building, but you need to set environment variables:

1. In your Railway project dashboard, go to the **Variables** tab
2. Add the following environment variable:

   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-api-url.com
   ```

   **Important:** Replace `https://your-backend-api-url.com` with your actual backend API URL. 
   - If your backend is also on Railway, use the Railway-provided URL
   - If your backend is elsewhere, use that URL
   - Make sure to use `https://` (not `http://`) for production

### 3. Railway Auto-Detection

Railway automatically detects Next.js projects and will:
- Use `pnpm install` (since you have `pnpm-lock.yaml`)
- Run `pnpm build` to build the project
- Run `pnpm start` to start the production server

### 4. Configure Build Settings (Optional)

If Railway doesn't auto-detect correctly, you can manually set:

**Build Command:**
```bash
pnpm build
```

**Start Command:**
```bash
pnpm start
```

**Root Directory:**
```
./
```

### 5. Deploy

1. Railway will automatically deploy when you push to your main branch
2. You can also manually trigger a deployment from the Railway dashboard
3. Wait for the build to complete (usually 2-5 minutes)

### 6. Get Your Application URL

1. Once deployed, Railway will provide you with a URL like: `https://your-app-name.up.railway.app`
2. You can also set a custom domain in the **Settings** tab

## Important Notes

### Environment Variables

- **NEXT_PUBLIC_API_BASE_URL**: This is the only required environment variable
- Make sure your backend API URL is accessible from the internet
- Use HTTPS URLs in production (Railway provides HTTPS automatically)

### CORS Configuration

If your backend API is on a different domain, make sure your backend allows requests from your Railway frontend URL. You may need to update CORS settings on your backend.

### Port Configuration

Railway automatically sets the `PORT` environment variable. Next.js will use this automatically, so you don't need to configure it manually.

## Troubleshooting

### Build Fails

1. Check the build logs in Railway dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version compatibility (your project uses Next.js 16, which requires Node 18+)

### API Calls Fail

1. Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly
2. Check that your backend API is accessible
3. Check browser console for CORS errors
4. Verify your backend allows requests from your Railway domain

### Application Not Loading

1. Check the deployment logs
2. Verify the build completed successfully
3. Check that `pnpm start` is running correctly

## Updating Your Deployment

Every time you push to your main branch, Railway will automatically:
1. Pull the latest code
2. Install dependencies
3. Build the project
4. Deploy the new version

You can also manually trigger deployments from the Railway dashboard.

## Custom Domain (Optional)

1. Go to your service **Settings**
2. Click **Generate Domain** or add a custom domain
3. Follow Railway's instructions to configure DNS

## Monitoring

Railway provides:
- Real-time logs
- Deployment history
- Resource usage metrics
- Error tracking

Access these from your project dashboard.

