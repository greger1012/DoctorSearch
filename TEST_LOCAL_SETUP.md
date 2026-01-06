# Test Local Setup (As If You're the Client)

This guide helps you test the app exactly as your client will experience it.

## Step 1: Fresh Start (Simulate Client Download)

**Option A: Test from a fresh copy**
1. Create a new folder: `C:\Users\grego\DoctorSearch-Test`
2. Copy the entire project there (or download from GitHub)
3. Open terminal in that folder

**Option B: Test in current folder**
- Just make sure you're starting fresh (or skip if you've already set it up)

## Step 2: Follow the Simple Setup

Open `QUICK_START.md` or `SIMPLE_SETUP.md` and follow the steps exactly as written.

**Quick version:**
```powershell
# 1. Install dependencies
npm run setup

# 2. Start Elasticsearch (in one terminal, keep it open)
npm run elasticsearch

# 3. Wait 30 seconds, then in a NEW terminal:
cd C:\Users\grego\interviewprep
npm run startup
npm run import:excel
npm run import:locations

# 4. Start the app
npm run dev
```

## Step 3: Test Everything

Once the app opens at http://localhost:3000, test these:

### ✅ Basic Search
- [ ] Search for "UCSF doctors" → Should show results
- [ ] Search for "cardiologists" → Should show cardiology doctors
- [ ] Search for "neurologists" → Should show neurology doctors

### ✅ Specialty Filter
- [ ] Click "Filters" button
- [ ] Select a specialty from dropdown
- [ ] Search → Results should be filtered by that specialty

### ✅ Location Filter
- [ ] Click "Filters" button
- [ ] Select a location from dropdown
- [ ] Search → Results should be filtered by that location

### ✅ Doctor Details
- [ ] Click on any doctor from search results
- [ ] Should see doctor's full profile
- [ ] Should see specialties, location, contact info

### ✅ Advanced Searches
- [ ] Search for "movement disorders" → Should show relevant doctors
- [ ] Search for "pediatric cancer" → Should show pediatric oncologists
- [ ] Search for "Berkeley" → Should show doctors in Berkeley

### ✅ AI Summaries (if API key configured)
- [ ] Search for a medical condition
- [ ] Should see an AI-generated explanation at the top
- [ ] If no API key, should see template-based summary (still works!)

## Step 4: Verify Data

Check that all data is loaded:

```powershell
npm run check:data
```

Should show:
- ✅ doctors: EXISTS (5481 documents)
- ✅ locations: EXISTS (2878 documents)
- ✅ content: EXISTS (437 documents)

## Step 5: Test Edge Cases

- [ ] Search for something that doesn't exist → Should show "No results" gracefully
- [ ] Search with no filters → Should show all results
- [ ] Search with multiple filters → Should combine filters correctly
- [ ] Click "Clear filters" → Should reset everything

## Step 6: Test Performance

- [ ] Search should respond in < 2 seconds
- [ ] Page should load quickly
- [ ] No console errors in browser (F12 → Console tab)

## What to Report

If everything works:
✅ **"All tests passed - ready for client!"**

If something doesn't work:
❌ **"Issue: [describe what happened]"**
- What you searched for
- What you expected
- What actually happened
- Any error messages

## Common Issues

**"No results"**
→ Make sure you ran `npm run startup`, `npm run import:excel`, and `npm run import:locations`

**"Elasticsearch connection refused"**
→ Make sure Docker Desktop is running and you ran `npm run elasticsearch`

**"Port already in use"**
→ Close other apps using ports 3000 or 9200

**"Cannot find module"**
→ Run `npm run setup` first

## Success Criteria

✅ App opens at http://localhost:3000
✅ Search returns results
✅ Filters work
✅ Doctor details load
✅ No console errors
✅ Fast response times

If all these pass, the app is ready for your client!

