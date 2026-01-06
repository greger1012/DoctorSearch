# Importing Data on Railway

Your app is deployed but showing "No results found" because the data hasn't been imported yet. Here's how to import it.

## Quick Check

First, let's check if data exists:

**Using Railway CLI:**
```bash
railway run npm run check:data
```

**Or using Railway Dashboard:**
1. Go to your Railway project
2. Click on your web service
3. Click "Deployments" tab
4. Click "View Logs" or "Open Shell"
5. Run: `npm run check:data`

This will show you:
- ✅ If Elasticsearch is connected
- ✅ Which indices exist
- ✅ How many documents are in each index
- ⚠️ If data needs to be imported

## Import Data

If the check shows no data (0 documents), you need to import it. Here's how:

### Method 1: Using Railway CLI (Recommended)

1. **Install Railway CLI** (if not already installed):
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and Link**:
   ```bash
   railway login
   railway link
   ```
   (Select your DoctorSearch project when prompted)

3. **Import Data** (run these commands one by one):
   ```bash
   # Step 1: Create indices and import doctors
   railway run npm run startup
   
   # Step 2: Import services and Excel data
   railway run npm run import:excel
   
   # Step 3: Import locations
   railway run npm run import:locations
   ```

   **Or run all at once:**
   ```bash
   railway run npm run startup && railway run npm run import:excel && railway run npm run import:locations
   ```

### Method 2: Using Railway Dashboard

1. **Go to Railway Dashboard**:
   - Visit [railway.app](https://railway.app)
   - Click on your `DoctorSearch` project
   - Click on your web service

2. **Open Shell**:
   - Click on "Deployments" tab
   - Click on the latest deployment
   - Click "View Logs" or look for "Open Shell" / "Terminal" button

3. **Run Import Commands**:
   ```bash
   # Step 1: Create indices and import doctors
   npm run startup
   
   # Step 2: Import services and Excel data
   npm run import:excel
   
   # Step 3: Import locations
   npm run import:locations
   ```

## What Gets Imported

### Step 1: `npm run startup`
- Creates Elasticsearch indices (doctors, locations, content)
- Imports **5,481 doctors** from `doctorsdata.CSV`
- Sets up basic index mappings
- **Takes ~2-5 minutes**

### Step 2: `npm run import:excel`
- Imports **233 medical services** from `Greg Specifics.xlsx`
- Links doctors to services via NPI matching
- Adds matched specialties to doctors
- Enriches doctor profiles with service information
- **Takes ~1-2 minutes**

### Step 3: `npm run import:locations`
- Imports **621 locations** from LocationCatalog
- Adds location details (addresses, phone, etc.)
- Links locations to services
- **Takes ~1 minute**

## Verify Import

After importing, verify the data:

```bash
railway run npm run check:data
```

You should see:
```
✅ Elasticsearch is connected

📊 Index Status:
==================================================
  doctors: ✅ EXISTS (5481 documents)
  locations: ✅ EXISTS (621 documents)
  content: ✅ EXISTS (233 documents)

Total documents: 6335

✅ Data is loaded!
```

## Test the App

1. **Visit your app**: `https://your-app.railway.app`
2. **Try searching for**:
   - "UCSF doctors"
   - "cardiologists"
   - "neurologists"
   - "movement disorders"
3. **You should see results!**

## Troubleshooting

### Import Fails with "Cannot find module"

**Problem**: Missing dependencies

**Solution**: 
```bash
# Reinstall dependencies
railway run npm install
railway run cd server && npm install
```

### Import Fails with "File not found"

**Problem**: Data files not in the repository

**Solution**: 
- Make sure `doctorsdata.CSV` and `Greg Specifics.xlsx` are in your GitHub repo
- They should be in the root directory
- Check Railway logs to see which file is missing

### Import Takes Too Long

**Problem**: Large data files

**Solution**: 
- This is normal! The import can take 5-10 minutes total
- Be patient and let it complete
- Check Railway logs to see progress

### "No results found" After Import

**Problem**: Data imported but search not working

**Solution**:
1. Verify data exists: `railway run npm run check:data`
2. Check if indices are correct
3. Try a simple search like "UCSF"
4. Check Railway logs for search errors

### Import Partially Completes

**Problem**: One step fails but others succeed

**Solution**:
- You can re-run individual steps:
  ```bash
  railway run npm run import:excel  # Re-run just Excel import
  railway run npm run import:locations  # Re-run just locations
  ```
- The scripts are idempotent (safe to run multiple times)

## Expected Results

After successful import, you should have:

- **5,481 doctors** searchable
- **621 locations** searchable  
- **233 medical services** searchable
- **All doctors linked to services** via NPI matching
- **All matched specialties** from ServiceProviders working
- **All specialty connections** from Services tab working

## Quick Reference

```bash
# Check data status
railway run npm run check:data

# Import all data
railway run npm run startup
railway run npm run import:excel
railway run npm run import:locations

# Re-import specific data
railway run npm run import:excel      # Services only
railway run npm run import:locations  # Locations only
```

## Need Help?

- Check Railway logs for specific error messages
- Run `railway run npm run check:data` to see current status
- Verify files exist: `railway run ls -la` (should show doctorsdata.CSV and Greg Specifics.xlsx)

