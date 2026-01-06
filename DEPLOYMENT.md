# Deployment Guide

This guide explains how to deploy the DoctorSearch app so your client can access it with one click.

## Deployment Options

### Option 1: Railway (Recommended - Easiest)

Railway is the easiest option for one-click deployment with GitHub integration.

#### Steps:

1. **Sign up for Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `DoctorSearch` repository

3. **Add Elasticsearch Service**
   - In your Railway project, click "New"
   - Select "Database" → "Elasticsearch"
   - Railway will provision an Elasticsearch instance automatically

4. **Configure Environment Variables**
   - In your web service settings, add:
     - `ELASTICSEARCH_URL`: Get this from your Elasticsearch service (Railway provides it)
     - `NODE_ENV`: `production`
     - `GROQ_API_KEY`: (Optional, for AI summaries)

5. **Deploy**
   - Railway will automatically build and deploy
   - Your app will be live at a `*.railway.app` URL

6. **Initialize Data** (One-time setup)
   - After first deployment, you'll need to run the data import scripts
   - You can do this via Railway's CLI or by adding a one-time script

**Note**: Railway has a free tier that's perfect for demos. For production, consider their paid plans.

---

### Option 2: Render

Render is another great option with similar GitHub integration.

#### Steps:

1. **Sign up for Render**
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select your `DoctorSearch` repo

3. **Configure Build Settings**
   - Build Command: `npm run setup && npm run build`
   - Start Command: `npm start`
   - Environment: `Node`

4. **Add Elasticsearch**
   - Click "New" → "Redis" (or use external Elasticsearch service)
   - **OR** use a managed Elasticsearch service like [Elastic Cloud](https://www.elastic.co/cloud)

5. **Set Environment Variables**
   - `ELASTICSEARCH_URL`: Your Elasticsearch connection string
   - `NODE_ENV`: `production`
   - `GROQ_API_KEY`: (Optional)

6. **Deploy**
   - Render will build and deploy automatically
   - Your app will be live at a `*.onrender.com` URL

---

### Option 3: Vercel (Frontend) + Railway/Render (Backend)

For more control, you can split frontend and backend:

1. **Deploy Backend** to Railway or Render (as above)
2. **Deploy Frontend** to Vercel:
   - Connect GitHub repo
   - Set build command: `cd client && npm install && npm run build`
   - Set output directory: `client/build`
   - Add environment variable: `REACT_APP_API_URL` pointing to your backend

---

## Important Notes

### Elasticsearch Hosting

Since Elasticsearch requires significant resources, you have a few options:

1. **Managed Elasticsearch** (Recommended for production):
   - [Elastic Cloud](https://www.elastic.co/cloud) - Free 14-day trial
   - [AWS Elasticsearch](https://aws.amazon.com/elasticsearch-service/)
   - [Bonsai](https://bonsai.io) - Simple Elasticsearch hosting

2. **Railway/Render with Docker**:
   - Some platforms allow running Elasticsearch in Docker
   - Check platform documentation for Docker support

3. **Separate VPS**:
   - Deploy Elasticsearch on a separate server
   - Point your app to that server's URL

### Data Initialization

After deployment, you need to import your data:

1. **Option A: Automated (Recommended)**
   - Add a startup script that checks if data exists
   - If not, automatically imports data
   - See `server/scripts/startup.js` for reference

2. **Option B: Manual**
   - SSH into your deployment
   - Run: `npm run startup`
   - Then: `npm run import:excel`
   - Then: `npm run import:locations`

### Environment Variables

Make sure to set these in your deployment platform:

- `ELASTICSEARCH_URL`: Your Elasticsearch connection URL
- `NODE_ENV`: `production`
- `GROQ_API_KEY`: (Optional, for AI summaries)
- `PORT`: Usually auto-set by platform

---

## One-Click Deployment Button

Once deployed, you can add a "Deploy to Railway" or "Deploy to Render" button to your GitHub README:

### For Railway:
```markdown
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)
```

### For Render:
```markdown
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
```

---

## Post-Deployment Checklist

- [ ] Elasticsearch is running and accessible
- [ ] Environment variables are set
- [ ] Data has been imported (doctors, locations, services)
- [ ] Frontend is serving correctly
- [ ] API endpoints are working
- [ ] Search functionality is working
- [ ] Health check endpoint returns healthy status

---

## Troubleshooting

### Elasticsearch Connection Issues
- Verify `ELASTICSEARCH_URL` is correct
- Check if Elasticsearch service is running
- Verify network/firewall settings

### Build Failures
- Check Node.js version (should be 16+)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### Data Not Showing
- Run data import scripts
- Check Elasticsearch indices exist
- Verify data was imported successfully

---

## Cost Estimates

- **Railway**: Free tier available, ~$5-20/month for small production use
- **Render**: Free tier available, ~$7-25/month for small production use
- **Elastic Cloud**: Free 14-day trial, then ~$16/month for basic tier
- **Vercel**: Free tier for frontend, generous limits

---

## Need Help?

If you encounter issues during deployment, check:
1. Platform-specific documentation
2. Application logs in the deployment dashboard
3. Health check endpoint: `https://your-app-url.com/health`

