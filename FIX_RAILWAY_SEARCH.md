# Fix: Search Not Working on Railway

Your data is loaded (5,481 doctors, 2,878 locations, 437 services), but search isn't working. Here's why and how to fix it.

## The Problem

The check showed:
```
Elasticsearch URL: http://localhost:9200
```

This means `ELASTICSEARCH_URL` environment variable is **not set** in Railway. The app is trying to connect to `localhost:9200` which doesn't exist on Railway.

## The Fix

### Step 1: Set Up Elasticsearch

You need to set up an Elasticsearch service and configure the URL. Choose one:

**Option A: Elastic Cloud (Easiest)**
1. Go to [cloud.elastic.co](https://cloud.elastic.co)
2. Sign up (free 14-day trial)
3. Create a deployment
4. Get your Elasticsearch endpoint URL (looks like `https://xxxxx.es.io:9243`)

**Option B: Check if Railway has Elasticsearch**
1. In Railway, click "New" in your project
2. Look for "Database" or search "Elasticsearch"
3. If available, add it (Railway will auto-set the URL)

### Step 2: Set Environment Variable in Railway

1. **Go to Railway Dashboard**
2. **Click on your "web" service**
3. **Click "Settings" tab** (in top navigation)
4. **Click "Variables"** section
5. **Click "New Variable"**
6. **Add**:
   - **Name**: `ELASTICSEARCH_URL`
   - **Value**: Your Elasticsearch URL (from Step 1)
   - Example: `https://xxxxx.us-east-1.aws.cloud.es.io:9243`
7. **Click "Add"**

### Step 3: Railway Will Auto-Redeploy

Railway automatically redeploys when you add environment variables. Wait for it to finish.

### Step 4: Verify It's Working

1. **Check health**: Visit `https://your-app.railway.app/health`
   - Should show: `{"status":"healthy","elasticsearch":"connected"}`

2. **Test search**: Go to your app and search for "UCSF doctors"
   - You should see results!

## Quick Checklist

- [ ] Elasticsearch service is set up (Elastic Cloud, Bonsai, etc.)
- [ ] `ELASTICSEARCH_URL` environment variable is set in Railway
- [ ] Railway has redeployed after setting the variable
- [ ] Health check shows "healthy"
- [ ] Search returns results

## If Search Still Doesn't Work

1. **Check Railway Logs**:
   - Go to your service → "Deployments" → Latest deployment → "View Logs"
   - Look for errors

2. **Check Browser Console**:
   - Open your app in browser
   - Press F12 to open developer tools
   - Go to "Console" tab
   - Look for errors when you search

3. **Verify API is Working**:
   - Try: `https://your-app.railway.app/api/search`
   - Should return an error (needs POST with query), but confirms API is accessible

## Current Status

✅ **Data is loaded**: 5,481 doctors, 2,878 locations, 437 services
❌ **Elasticsearch not configured**: Need to set `ELASTICSEARCH_URL`
✅ **App is deployed**: Frontend and backend are running

Once you set `ELASTICSEARCH_URL`, everything should work!

