# Fix: "npm error Missing script: 'setup'"

## The Problem

You're getting this error:
```
npm error Missing script: "setup"
```

This usually means you're in the wrong folder, or the ZIP extraction created a nested folder structure.

## The Solution

### Step 1: Find the Correct Folder

1. **Open File Explorer**
2. **Navigate to**: `C:\Users\grego\Downloads\DoctorSearch-main`
3. **Look inside** - you might see another `DoctorSearch-main` folder
4. **Open that inner folder**
5. **Check if you see these files**:
   - ✅ `package.json`
   - ✅ `README.md`
   - ✅ `server` folder
   - ✅ `client` folder
   - ✅ `doctorsdata.CSV`

**If you see these files, you're in the right place!**

### Step 2: Open Terminal in the Correct Folder

**Option A: Right-click method**
1. In File Explorer, navigate to the folder with `package.json`
2. **Right-click in an empty area** of that folder
3. Select **"Open in Terminal"** or **"Open PowerShell window here"**

**Option B: Manual navigation**
1. Open PowerShell
2. Type:
   ```powershell
   cd C:\Users\grego\Downloads\DoctorSearch-main\DoctorSearch-main
   ```
   (Adjust the path if your folder is different)

### Step 3: Verify You're in the Right Place

In the terminal, type:
```powershell
dir package.json
```

**You should see**: `package.json` listed

**If you see**: `Cannot find path` → You're in the wrong folder, go back to Step 1

### Step 4: Now Run Setup

Once you're in the correct folder:
```powershell
npm run setup
```

This should work now!

## Quick Check Command

To verify you're in the right folder, run:
```powershell
Test-Path package.json
```

**Should show**: `True`

If it shows `False`, navigate to the correct folder.

## Alternative: Use the Full Path

If you're having trouble, you can always run commands with the full path:

```powershell
cd C:\Users\grego\Downloads\DoctorSearch-main\DoctorSearch-main
npm run setup
```

(Replace with your actual folder path)

## Still Having Issues?

1. **Check the folder structure**:
   ```powershell
   Get-ChildItem -Recurse -Filter "package.json" | Select-Object FullName
   ```
   This will show you where `package.json` actually is.

2. **Verify the ZIP extracted correctly**:
   - Make sure the ZIP file downloaded completely
   - Try extracting again if needed

3. **Make sure you're using the right terminal**:
   - Use PowerShell or Command Prompt
   - Not Git Bash or WSL (unless you're in the right directory there too)

