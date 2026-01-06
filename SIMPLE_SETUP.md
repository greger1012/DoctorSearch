# Simple Local Setup - Run on Your Computer

This guide shows you how to download and run the app on your computer, just like your client will.

## Step 1: Download the Code

**Option A: From GitHub (for your client)**
1. Go to: https://github.com/greger1012/DoctorSearch
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the ZIP file to a folder (e.g., `C:\Users\YourName\DoctorSearch`)

**Option B: You already have it**
- You're already in the project directory: `C:\Users\grego\interviewprep`

## Step 2: Install Prerequisites

You need these installed on your computer:

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Install it (just click Next, Next, Next)
   - Verify: Open terminal and run `node --version` (should show v16+)

2. **Docker Desktop** (for Elasticsearch)
   - Download from: https://www.docker.com/products/docker-desktop
   - Install it
   - Make sure it's running (you'll see a Docker icon in your system tray)

## Step 3: Open Terminal in Project Folder

**Windows:**
1. Navigate to the project folder in File Explorer
2. Right-click in the folder
3. Select **"Open in Terminal"** or **"Open PowerShell window here"**

**Or manually:**
```powershell
cd C:\Users\grego\interviewprep
```

## Step 4: Install Dependencies

Run this command (takes 2-3 minutes):

```powershell
npm run setup
```

This installs all the required packages.

## Step 5: Start Elasticsearch

```powershell
npm run elasticsearch
```

Wait about 30 seconds for Elasticsearch to start. You'll see messages like "started" when it's ready.

**Note**: Keep this terminal window open - Elasticsearch needs to keep running.

## Step 6: Import Your Data

Open a **NEW terminal window** (keep the Elasticsearch one running) and run:

```powershell
cd C:\Users\grego\interviewprep
npm run startup
```

Wait for it to finish (takes 2-3 minutes). You'll see:
```
✅ Imported 5481 doctors
```

Then run:

```powershell
npm run import:excel
```

Wait for it to finish (takes 1-2 minutes). You'll see:
```
✅ Indexed 233 services
```

Then run:

```powershell
npm run import:locations
```

Wait for it to finish (takes 1 minute). You'll see:
```
✅ Indexed 621 locations
```

## Step 7: Start the App

In the same terminal, run:

```powershell
npm run dev
```

This starts both the backend server and frontend.

## Step 8: Open the App

After a few seconds, your browser should automatically open to:
**http://localhost:3000**

If it doesn't, manually open your browser and go to: **http://localhost:3000**

## Step 9: Test It!

1. **Try searching**: Type "UCSF doctors" in the search box
2. **You should see results!**
3. **Try other searches**:
   - "cardiologists"
   - "neurologists"
   - "movement disorders"

## Stopping the App

When you're done:
1. In the terminal where `npm run dev` is running, press **Ctrl+C**
2. In the terminal where Elasticsearch is running, press **Ctrl+C**
3. Then run: `npm run elasticsearch:stop`

## Next Time You Run It

After the first setup, you only need:

1. **Start Elasticsearch**:
   ```powershell
   npm run elasticsearch
   ```

2. **Start the app**:
   ```powershell
   npm run dev
   ```

You don't need to import data again - it's already there!

## Troubleshooting

### "Cannot find module" errors
- Make sure you ran `npm run setup` first
- Make sure you're in the project directory

### "Elasticsearch connection refused"
- Make sure Docker Desktop is running
- Make sure you ran `npm run elasticsearch` and waited 30 seconds
- Check Docker Desktop to see if Elasticsearch container is running

### "Port 3000 already in use"
- Another app is using port 3000
- Close that app, or change the port in `client/package.json`

### "Port 9200 already in use"
- Elasticsearch is already running
- You can skip `npm run elasticsearch` step

### No search results
- Make sure you imported the data (Step 6)
- Check that Elasticsearch is running
- Try the health check: http://localhost:3001/health

## What Gets Installed

- **Node.js packages**: All the code dependencies
- **Elasticsearch**: Search engine (runs in Docker)
- **Data**: 5,481 doctors, 621 locations, 233 services

## File Size

The project is about 50-100 MB (mostly `node_modules`). The data files (`doctorsdata.CSV` and `Greg Specifics.xlsx`) are included.

## System Requirements

- **Windows 10/11**, **Mac**, or **Linux**
- **4 GB RAM** minimum (8 GB recommended)
- **2 GB free disk space**
- **Internet connection** (only for initial setup to download packages)

## For Your Client

Share this guide with them, or create a simple README. They just need to:
1. Download the code
2. Install Node.js and Docker
3. Run the setup commands
4. Start the app

That's it!

