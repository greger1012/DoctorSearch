# Railway Deployment Guide

This is a quick setup guide specifically for Railway deployment.

## Prerequisites

✅ You have a Railway account (you mentioned you created one)
✅ Your code is pushed to GitHub (just completed!)

## Step-by-Step Railway Deployment

### 1. Create New Project on Railway

1. Go to [railway.app](https://railway.app) and log in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `DoctorSearch` repository
5. Railway will automatically detect it's a Node.js project

### 2. Add Elasticsearch Service

**Option A: Use Railway's Elasticsearch Plugin (Recommended)**
- In your Railway project, click **"New"**
- Look for **"Database"** or search for **"Elasticsearch"**
- If available, add it as a service
- Railway will provide the connection URL automatically

**Option B: Use External Elasticsearch (If Railway doesn't have plugin)**
- Use [Elastic Cloud](https://www.elastic.co/cloud) (free 14-day trial)
- Or use [Bonsai](https://bonsai.io) (simple Elasticsearch hosting)
- You'll need to manually set the connection URL

### 3. Configure Environment Variables

In your Railway project settings, go to **"Variables"** and add:

**Required:**
```
NODE_ENV=production
PORT=10000
```

**Elasticsearch (get from your Elasticsearch service):**
```
ELASTICSEARCH_URL=https://your-elasticsearch-url:9200
```

**Optional (for AI summaries):**
```
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=llama-3.1-70b-versatile
LLM_PROVIDER=groq
```

### 4. Configure Build Settings

Railway should auto-detect, but verify:

- **Build Command**: `npm run setup && npm run build`
- **Start Command**: `npm start`
- **Root Directory**: `/` (root of repo)

### 5. Deploy

Railway will automatically:
1. Install dependencies (`npm run setup` runs `postinstall`)
2. Build the React frontend (`npm run build`)
3. Start the server (`npm start`)

### 6. Initialize Data (One-Time Setup)

After first deployment, you need to import your data. You have two options:

**Option A: Via Railway CLI (Recommended)**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run data import
railway run npm run startup
railway run npm run import:excel
railway run npm run import:locations
```

**Option B: Via Railway Dashboard**
1. Go to your service in Railway
2. Click on "Deployments"
3. Open a shell/terminal
4. Run the commands:
   ```bash
   npm run startup
   npm run import:excel
   npm run import:locations
   ```

### 7. Verify Deployment

1. Check your app URL (Railway provides one like `your-app.railway.app`)
2. Visit `/health` endpoint to verify Elasticsearch connection
3. Test the search functionality

## Important Notes

### File Size Limits
- Railway has file size limits for deployments
- `Greg Specifics.xlsx` is included in the repo (should be fine)
- If you hit limits, you may need to exclude large files from git

### Elasticsearch Memory
- Elasticsearch needs at least 512MB RAM
- Railway's free tier may have limitations
- Consider using external Elasticsearch service for production

### Data Persistence
- Railway's free tier may not persist data between deployments
- Consider using Railway's persistent volumes or external Elasticsearch

### Custom Domain
- Railway allows custom domains on paid plans
- Free tier gets a `*.railway.app` domain

## Troubleshooting

### Build Fails
- Check Railway logs for specific errors
- Verify Node.js version (should be 16+)
- Ensure all dependencies are in `package.json`

### Elasticsearch Connection Fails
- Verify `ELASTICSEARCH_URL` is correct
- Check if Elasticsearch service is running
- Verify network/firewall settings

### Data Not Showing
- Run data import scripts (see Step 6)
- Check Elasticsearch indices exist
- Verify data was imported successfully

### App Crashes on Startup
- Check Railway logs
- Verify environment variables are set
- Check if port is correctly configured

## Post-Deployment Checklist

- [ ] App is accessible at Railway URL
- [ ] `/health` endpoint returns healthy status
- [ ] Elasticsearch is connected
- [ ] Data has been imported (doctors, locations, services)
- [ ] Search functionality works
- [ ] Frontend is serving correctly
- [ ] Environment variables are set

## Cost Estimate

- **Railway Free Tier**: 
  - $5 credit/month
  - Good for demos and testing
  - May need to upgrade for production

- **Railway Paid Plans**:
  - Starts at ~$5-20/month
  - Better for production use
  - More resources and features

## Next Steps

Once deployed:
1. Share the Railway URL with your client
2. Monitor usage and performance
3. Set up custom domain (if needed)
4. Configure backups for data
5. Set up monitoring/alerts

## Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check Railway logs for specific errors

