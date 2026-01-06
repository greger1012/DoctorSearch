# Step-by-Step: Import Data on Railway

Follow these exact steps to import your data.

## Step 1: Open the Terminal/Shell

From the Railway dashboard where you're currently viewing your service:

1. **Look at the tabs at the top** - You should see:
   - "Details" (currently selected)
   - "Build Logs"
   - "Deploy Logs"  
   - "HTTP Logs"

2. **Click on "Deploy Logs" tab** - This will show you the deployment logs

3. **Look for a button or link** that says one of these:
   - "Open Shell"
   - "Terminal"
   - "Run Command"
   - "Execute Command"
   - Or look for a terminal/command icon

   **OR**

4. **Alternative: Look in the top right area** of the service details page for:
   - A terminal icon
   - A "Shell" button
   - A "Run" button
   - A dropdown menu with "Shell" or "Terminal" option

## Step 2: If You Can't Find Shell/Terminal

If you don't see a shell option, you can use Railway CLI instead:

### Install Railway CLI on Your Computer

1. **Open your computer's terminal/command prompt** (not Railway's dashboard)

2. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   ```

3. **Login to Railway**:
   ```bash
   railway login
   ```
   (This will open a browser window to authenticate)

4. **Link to your project**:
   ```bash
   railway link
   ```
   (Select your "easygoing-vibrancy" or "DoctorSearch" project when prompted)

5. **Now run the import commands**:
   ```bash
   railway run npm run startup
   railway run npm run import:excel
   railway run npm run import:locations
   ```

## Step 3: What to Look For in Railway Dashboard

If you're still in the Railway dashboard, here are specific places to check:

### Option A: Service Settings
1. Click on **"Settings"** in the top navigation (next to "Architecture", "Observability", "Logs")
2. Look for a **"Shell"** or **"Terminal"** section
3. Or look for **"Run Command"** or **"Execute"** options

### Option B: Deployments Tab
1. In your service view, look for a **"Deployments"** section or tab
2. Click on the latest deployment
3. Look for **"View Logs"** or **"Open Shell"** button

### Option C: Service Actions Menu
1. Look for a **three-dot menu** (...) near your service name
2. Click it and look for **"Shell"**, **"Terminal"**, or **"Run Command"**

## Step 4: Once You Have Terminal Access

Once you can run commands (either in Railway's shell or via CLI), run these **one at a time**:

```bash
# Command 1: Import doctors and create indices
npm run startup

# Wait for it to finish, then run:
npm run import:excel

# Wait for it to finish, then run:
npm run import:locations
```

Each command will take a few minutes. You'll see progress messages.

## Visual Guide: What You Should See

When running the commands, you should see output like:

```
🔄 Starting UCSF doctors CSV import...
✅ Imported 5481 doctors
✅ Created indices

🔄 Starting Excel data import...
✅ Indexed 233 services
✅ Updated 2936 doctors

🔄 Importing Location Catalog...
✅ Indexed 621 locations
```

## Still Can't Find It?

If you still can't find where to run commands, try this:

1. **Take a screenshot** of your Railway dashboard
2. **Or tell me**:
   - What tabs/buttons you see at the top
   - What options are in the left sidebar
   - What's in the main content area

And I'll give you more specific directions!

## Quick Alternative: Use Railway CLI

The easiest way is to use Railway CLI on your own computer:

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Link to your project
railway link
# (Select your project when prompted)

# 4. Check current data status
railway run npm run check:data

# 5. Import data
railway run npm run startup
railway run npm run import:excel
railway run npm run import:locations
```

This way you don't need to find the shell in the Railway dashboard - you run everything from your computer's terminal!

