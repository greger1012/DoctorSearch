# Using Your Deployed App

Once your app is deployed on Railway, here's how to access and use it.

## Accessing Your App

### 1. Get Your App URL

1. Go to your Railway dashboard: [railway.app](https://railway.app)
2. Click on your `DoctorSearch` project
3. Click on your web service
4. You'll see a **"Settings"** tab
5. Under **"Domains"**, you'll find your app URL (e.g., `your-app.railway.app`)

### 2. Open Your App

- Click the URL or copy it and paste it in your browser
- The app should load and show the search interface

## First-Time Setup

### Check if Data is Loaded

1. **Visit the health endpoint**: `https://your-app-url.railway.app/health`
   - Should return: `{"status":"healthy","elasticsearch":"connected"}`
   - If it says "unhealthy", Elasticsearch isn't connected yet

2. **Try a search**: Type "UCSF doctors" in the search box
   - If you see results, data is loaded ✅
   - If you see "No results found", you need to import data

### Import Data (If Needed)

If the app is running but has no data, you need to import it:

**Option 1: Using Railway CLI (Recommended)**

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link to your project:
   ```bash
   railway link
   ```
   (Select your DoctorSearch project when prompted)

4. Run the data import commands:
   ```bash
   railway run npm run startup
   railway run npm run import:excel
   railway run npm run import:locations
   ```

**Option 2: Using Railway Dashboard**

1. Go to your Railway project
2. Click on your web service
3. Click on the **"Deployments"** tab
4. Click on the latest deployment
5. Click **"View Logs"** or **"Open Shell"**
6. In the shell, run:
   ```bash
   npm run startup
   npm run import:excel
   npm run import:locations
   ```

**Note**: This may take a few minutes as it imports:
- 5,481 doctors from `doctorsdata.CSV`
- 233 medical services from `Greg Specifics.xlsx`
- 621 locations from the LocationCatalog

## Using the App

### Basic Search

1. **Simple Search**: Type what you're looking for
   - Examples:
     - "cardiologists"
     - "neurologists at Parnassus"
     - "doctors accepting new patients"
     - "movement disorders"

2. **View Results**: Results are organized into tabs:
   - **All**: All results combined
   - **Doctors**: Doctor profiles
   - **Locations**: Clinic/facility locations
   - **Content**: Medical services and information

### Advanced Features

1. **Filters**: Use the filter dropdowns to narrow results:
   - **Specialty**: Filter by medical specialty
   - **Location**: Filter by location/facility
   - **Accepting Patients**: Show only doctors accepting new patients

2. **Doctor Details**: Click on any doctor card to see:
   - Full profile information
   - Education and board certifications
   - Service specialties (from Excel data)
   - Location and contact information

3. **Example Queries**: Click on example queries below the search box for quick searches

## Troubleshooting

### App Won't Load

1. **Check Railway Status**:
   - Go to Railway dashboard
   - Check if the service is running (green status)
   - Check deployment logs for errors

2. **Check Environment Variables**:
   - Go to Settings → Variables
   - Verify `ELASTICSEARCH_URL` is set correctly
   - Verify `NODE_ENV=production`

3. **Check Health Endpoint**:
   - Visit `https://your-app-url.railway.app/health`
   - Should return healthy status

### No Search Results

1. **Data Not Imported**:
   - Follow the "Import Data" steps above
   - Check Railway logs to see if import completed

2. **Elasticsearch Not Connected**:
   - Verify `ELASTICSEARCH_URL` environment variable
   - Check if Elasticsearch service is running
   - Check health endpoint

3. **Indices Not Created**:
   - Run `npm run startup` to create indices
   - Check Railway logs for errors

### Slow Performance

1. **Check Railway Resources**:
   - Free tier has limited resources
   - Consider upgrading if needed

2. **Check Elasticsearch**:
   - External Elasticsearch services may have rate limits
   - Check Elasticsearch service status

## Sharing with Your Client

### Option 1: Share the Railway URL

1. Get your app URL from Railway dashboard
2. Share it directly with your client
3. They can access it from any browser

### Option 2: Custom Domain (Paid Plans)

1. In Railway, go to Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed
4. Share the custom domain with your client

### Option 3: Password Protection (If Needed)

Railway doesn't have built-in password protection, but you can:
- Use Railway's private deployments
- Add authentication middleware to the app
- Use a service like Cloudflare Access

## Monitoring

### Check App Status

1. **Railway Dashboard**:
   - View real-time logs
   - Check deployment status
   - Monitor resource usage

2. **Health Endpoint**:
   - `https://your-app-url.railway.app/health`
   - Returns app and Elasticsearch status

3. **Application Logs**:
   - View in Railway dashboard
   - Check for errors or warnings

## Common Tasks

### Update the App

1. Make changes to your code
2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. Railway will automatically detect and deploy

### Update Data

1. Update your CSV or Excel files
2. Push to GitHub
3. Re-run import scripts:
   ```bash
   railway run npm run import:excel
   railway run npm run import:locations
   ```

### View Logs

1. Go to Railway dashboard
2. Click on your service
3. Click "Deployments" tab
4. Click on a deployment
5. View logs in real-time

## Quick Reference

- **App URL**: Found in Railway dashboard → Settings → Domains
- **Health Check**: `https://your-app-url.railway.app/health`
- **Railway Dashboard**: [railway.app](https://railway.app)
- **Import Data**: `railway run npm run startup && railway run npm run import:excel && railway run npm run import:locations`

## Need Help?

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Check Logs**: Railway dashboard → Your service → Deployments → View logs

