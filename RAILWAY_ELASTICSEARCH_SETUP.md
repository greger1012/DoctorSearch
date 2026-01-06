# Setting Up Elasticsearch on Railway

Your app is crashing because Elasticsearch isn't configured. Here's how to fix it.

## The Problem

The app is trying to connect to `http://localhost:9200`, but on Railway, `localhost` refers to the container itself, not an external Elasticsearch service.

## Solution Options

### Option 1: Use Elastic Cloud (Recommended - Easiest)

Elastic Cloud offers a free 14-day trial and is the easiest to set up.

#### Steps:

1. **Sign up for Elastic Cloud**:
   - Go to [cloud.elastic.co](https://cloud.elastic.co)
   - Sign up for a free account
   - Start a free 14-day trial

2. **Create a Deployment**:
   - Click "Create deployment"
   - Choose a name (e.g., "doctorsearch")
   - Select a region close to you
   - Choose the smallest plan (for free tier)
   - Click "Create deployment"

3. **Get Your Connection URL**:
   - Wait for deployment to finish (2-3 minutes)
   - Click on your deployment
   - Go to "Endpoints" section
   - Copy the **Elasticsearch endpoint** URL
   - It will look like: `https://xxxxx.us-east-1.aws.cloud.es.io:9243`

4. **Set Environment Variable in Railway**:
   - Go to your Railway project
   - Click on your web service
   - Go to **Settings** → **Variables**
   - Click **"New Variable"**
   - Name: `ELASTICSEARCH_URL`
   - Value: Paste your Elasticsearch endpoint URL
   - Click **"Add"**

5. **Redeploy**:
   - Railway will automatically redeploy when you add environment variables
   - Or manually trigger a redeploy

6. **Verify**:
   - Visit: `https://your-app.railway.app/health`
   - Should return: `{"status":"healthy","elasticsearch":"connected"}`

---

### Option 2: Use Bonsai (Simple Elasticsearch Hosting)

Bonsai is another simple option for Elasticsearch hosting.

#### Steps:

1. **Sign up for Bonsai**:
   - Go to [bonsai.io](https://bonsai.io)
   - Sign up for a free account

2. **Create a Cluster**:
   - Click "Create Cluster"
   - Choose a name
   - Select a region
   - Choose the free tier (if available) or smallest plan

3. **Get Connection URL**:
   - After cluster is created, you'll see the connection URL
   - It will look like: `https://xxxxx:xxxxx@xxxxx-xxxxx.bonsaisearch.net`

4. **Set in Railway**:
   - Same as Option 1, step 4
   - Add `ELASTICSEARCH_URL` with your Bonsai URL

---

### Option 3: Use Railway's Elasticsearch Plugin (If Available)

Railway may have an Elasticsearch plugin you can add.

#### Steps:

1. **In Railway Dashboard**:
   - Go to your project
   - Click **"New"**
   - Look for **"Database"** or search for **"Elasticsearch"**

2. **If Available**:
   - Add the Elasticsearch service
   - Railway will automatically set the `ELASTICSEARCH_URL` environment variable
   - Your web service will automatically connect to it

3. **If Not Available**:
   - Use Option 1 (Elastic Cloud) instead

---

## After Setting Up Elasticsearch

Once `ELASTICSEARCH_URL` is configured:

1. **Wait for Railway to Redeploy** (automatic)

2. **Check Health**:
   - Visit: `https://your-app.railway.app/health`
   - Should show: `{"status":"healthy","elasticsearch":"connected"}`

3. **Import Your Data**:
   ```bash
   # Using Railway CLI
   railway run npm run startup
   railway run npm run import:excel
   railway run npm run import:locations
   
   # Or using Railway Dashboard shell
   npm run startup
   npm run import:excel
   npm run import:locations
   ```

4. **Test the App**:
   - Try searching for "UCSF doctors"
   - You should see results!

## Troubleshooting

### Still Getting Connection Errors?

1. **Verify Environment Variable**:
   - Go to Railway → Settings → Variables
   - Make sure `ELASTICSEARCH_URL` is set correctly
   - Make sure there are no extra spaces or quotes

2. **Check Elasticsearch Service**:
   - If using Elastic Cloud, check the deployment status
   - Make sure the deployment is "Started" and healthy

3. **Check URL Format**:
   - Should be: `https://xxxxx.es.io:9243` (Elastic Cloud)
   - Or: `https://xxxxx.bonsaisearch.net` (Bonsai)
   - Should NOT be: `http://localhost:9200`

4. **Check Railway Logs**:
   - Go to Railway dashboard
   - Click on your service
   - View logs to see connection errors

### App Starts But Shows "Unhealthy"

1. **Elasticsearch URL is Wrong**:
   - Double-check the URL in Railway environment variables
   - Make sure it includes the protocol (`https://`)

2. **Elasticsearch Service is Down**:
   - Check your Elasticsearch provider's dashboard
   - Restart the service if needed

3. **Network/Firewall Issues**:
   - Some Elasticsearch services require IP whitelisting
   - Check if Railway's IP needs to be whitelisted

## Cost Estimates

- **Elastic Cloud**: Free 14-day trial, then ~$16/month for basic tier
- **Bonsai**: Free tier available (limited), paid plans start ~$10/month
- **Railway Elasticsearch**: Varies (if available)

## Quick Checklist

- [ ] Elasticsearch service is running (Elastic Cloud, Bonsai, etc.)
- [ ] `ELASTICSEARCH_URL` environment variable is set in Railway
- [ ] URL is correct (starts with `https://`, not `http://localhost`)
- [ ] Railway has redeployed after setting the variable
- [ ] Health check shows "healthy"
- [ ] Data has been imported

## Need Help?

- **Elastic Cloud Docs**: https://www.elastic.co/guide/en/cloud/current/index.html
- **Bonsai Docs**: https://docs.bonsai.io
- **Railway Docs**: https://docs.railway.app
- **Check Railway Logs**: Dashboard → Your service → View logs

