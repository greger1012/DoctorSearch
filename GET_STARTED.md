# Get Started - From GitHub to Running App

Complete guide to download and run the app from scratch.

## Part 1: Install Prerequisites

Before downloading the code, install these two things:

### 1. Install Node.js

1. Go to: https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Run the installer
4. Click "Next" through all the steps (default settings are fine)
5. **Verify it worked**: Open a new terminal/PowerShell window and type:
   ```powershell
   node --version
   ```
   You should see something like `v20.11.0` (any version 16+ is fine)

### 2. Install Docker Desktop

1. Go to: https://www.docker.com/products/docker-desktop
2. Download Docker Desktop for Windows
3. Run the installer
4. Follow the installation wizard
5. **Start Docker Desktop** after installation
6. **Verify it's running**: You should see a Docker whale icon in your system tray (bottom right)

**Note**: Docker Desktop needs to be running whenever you use the app.

---

## Part 2: Download the Code

### Step 1: Go to GitHub

1. Open your web browser
2. Go to: **https://github.com/greger1012/DoctorSearch**
3. You'll see the project page with code files

### Step 2: Download the ZIP

1. **Click the green "Code" button** (top right, next to "About")
2. **Click "Download ZIP"**
3. The ZIP file will download to your Downloads folder

### Step 3: Extract the ZIP

1. **Find the ZIP file** in your Downloads folder (named `DoctorSearch-main.zip`)
2. **Right-click** on it
3. **Select "Extract All..."**
4. **Choose where to extract** (e.g., `C:\Users\YourName\DoctorSearch`)
5. **Click "Extract"**
6. You'll now have a folder called `DoctorSearch-main`

### Step 4: Navigate to the Correct Folder

**Important**: GitHub ZIP files sometimes create a nested folder. You need to find the folder that contains `package.json`.

1. **Open the extracted folder** in File Explorer
2. **Look for `package.json`** - this file should be visible in the folder
3. **If you see another `DoctorSearch-main` folder inside**, open that one instead
4. **You're in the right place when you see**:
   - `package.json` file
   - `README.md` file
   - `server` folder
   - `client` folder
   - `doctorsdata.CSV` file

---

## Part 3: Set Up the App

### Step 1: Open Terminal in the Project Folder

**Easiest way:**
1. In File Explorer, navigate to the `DoctorSearch` folder
2. **Right-click in an empty area** of the folder
3. Select **"Open in Terminal"** or **"Open PowerShell window here"**

**Alternative way:**
1. Press `Windows Key + R`
2. Type `powershell` and press Enter
3. Type: `cd C:\Users\YourName\DoctorSearch-main` (replace with your actual path)
4. Press Enter

### Step 2: Install Dependencies

In the terminal, type:

```powershell
npm run setup
```

Press Enter and **wait 2-3 minutes**. You'll see lots of messages about installing packages. This is normal!

**What you'll see:**
- `added 500 packages` (or similar numbers)
- Various installation messages
- This is installing all the code libraries the app needs

**When it's done**, you'll see your command prompt again (the `>` symbol).

### Step 3: Start Elasticsearch

**Important**: Make sure Docker Desktop is running first!

In the terminal, type:

```powershell
npm run elasticsearch
```

Press Enter and **wait about 30 seconds**. You'll see messages like:
- `Creating network...`
- `Creating container...`
- `Started`

**Keep this terminal window open!** Elasticsearch needs to keep running.

### Step 4: Import Your Data

**Open a NEW terminal window** (keep the Elasticsearch one running).

1. **Navigate to your project folder**:
   ```powershell
   cd C:\Users\YourName\DoctorSearch-main
   ```
   (Replace with your actual folder path)

2. **Import doctors**:
   ```powershell
   npm run startup
   ```
   Wait 2-3 minutes. You'll see:
   ```
   ✅ Imported 5481 doctors
   ```

3. **Import services**:
   ```powershell
   npm run import:excel
   ```
   Wait 1-2 minutes. You'll see:
   ```
   ✅ Indexed 233 services
   ```

4. **Import locations**:
   ```powershell
   npm run import:locations
   ```
   Wait 1 minute. You'll see:
   ```
   ✅ Indexed 621 locations
   ```

### Step 5: Start the App

In the same terminal (where you imported data), type:

```powershell
npm run dev
```

Press Enter. After a few seconds:
- Your browser should **automatically open** to http://localhost:3000
- If it doesn't, manually open your browser and go to: **http://localhost:3000**

**You should see the search page!**

---

## Part 4: Test It Works

1. **Type in the search box**: "UCSF doctors"
2. **Press Enter or click Search**
3. **You should see results!**

Try other searches:
- "cardiologists"
- "neurologists"
- "movement disorders"
- "Berkeley"

---

## Part 5: Using the App

### Daily Use

**Every time you want to use the app:**

1. **Make sure Docker Desktop is running** (check system tray)

2. **Open terminal in your project folder**:
   ```powershell
   cd C:\Users\YourName\DoctorSearch-main
   ```

3. **Start Elasticsearch** (in one terminal):
   ```powershell
   npm run elasticsearch
   ```
   Wait 30 seconds, keep this terminal open.

4. **Start the app** (in a new terminal):
   ```powershell
   cd C:\Users\YourName\DoctorSearch-main
   npm run dev
   ```

5. **Open your browser** to http://localhost:3000

**That's it!** You don't need to import data again - it's already there.

### Stopping the App

When you're done:
1. In the terminal where `npm run dev` is running, press **Ctrl+C**
2. In the terminal where Elasticsearch is running, press **Ctrl+C**
3. (Optional) To fully stop Elasticsearch: `npm run elasticsearch:stop`

---

## Troubleshooting

### "Cannot find module" or "npm: command not found"
→ You need to install Node.js first (see Part 1)

### "Docker is not running"
→ Start Docker Desktop from your Start menu

### "Elasticsearch connection refused"
→ Make sure you ran `npm run elasticsearch` and waited 30 seconds
→ Check Docker Desktop to see if containers are running

### "Port 3000 already in use"
→ Another app is using port 3000
→ Close that app, or restart your computer

### "No search results"
→ Make sure you completed Step 4 (import data)
→ Check that Elasticsearch is running
→ Try: http://localhost:3001/health (should show "healthy")

### "Cannot find the path specified"
→ Make sure you're in the correct folder
→ Check that you extracted the ZIP file correctly
→ Use `cd` command to navigate to the right folder

---

## What's Included

When you download from GitHub, you get:
- ✅ All the code
- ✅ All the data files (`doctorsdata.CSV`, `Greg Specifics.xlsx`)
- ✅ 1,884+ medical conditions database
- ✅ Everything needed to run the app

**You don't need to download anything else!**

---

## Need Help?

If something doesn't work:
1. Check the error message carefully
2. Make sure you followed all steps in order
3. Verify Docker Desktop is running
4. Verify Node.js is installed (`node --version`)
5. Check that you're in the correct folder

---

## Summary

**First time setup:**
1. Install Node.js and Docker Desktop
2. Download ZIP from GitHub
3. Extract ZIP to a folder
4. Open terminal in that folder
5. Run: `npm run setup`
6. Run: `npm run elasticsearch` (keep running)
7. Run: `npm run startup`, `npm run import:excel`, `npm run import:locations`
8. Run: `npm run dev`
9. Open browser to http://localhost:3000

**Every time after:**
1. Start Docker Desktop
2. Run: `npm run elasticsearch` (keep running)
3. Run: `npm run dev`
4. Open browser to http://localhost:3000

**That's it!** 🎉

