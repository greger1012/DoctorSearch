# Direct Import Commands for Railway

If `npm run` scripts aren't working, use these direct commands instead.

## Method 1: Direct Node Commands (Recommended)

Instead of `npm run startup`, run the scripts directly:

```bash
# Check data status
railway run node server/scripts/checkDataStatus.js

# Import doctors and create indices
railway run node server/scripts/startup.js

# Import Excel data (services)
railway run node server/scripts/importExcelData.js

# Import locations
railway run node server/scripts/importLocationCatalog.js
```

## Method 2: Make Sure You're in the Project Directory

If you want to use `npm run`, make sure Railway is running from the project root:

```bash
# First, navigate to your project directory
cd C:\Users\grego\interviewprep

# Then run Railway commands
railway run npm run check:data
railway run npm run startup
railway run npm run import:excel
railway run npm run import:locations
```

## Method 3: Check if Latest Code is Deployed

The scripts might not be in the deployed version yet. Check:

1. Go to Railway dashboard
2. Check the latest deployment
3. Make sure it shows the commit "Add data status check script..."
4. If not, trigger a new deployment or wait for auto-deploy

## Quick Fix: Use Direct Commands

**Run these commands one at a time** (from any directory, Railway will find the files):

```bash
railway run node server/scripts/checkDataStatus.js
railway run node server/scripts/startup.js
railway run node server/scripts/importExcelData.js
railway run node server/scripts/importLocationCatalog.js
```

This bypasses npm scripts and runs the Node.js files directly.

