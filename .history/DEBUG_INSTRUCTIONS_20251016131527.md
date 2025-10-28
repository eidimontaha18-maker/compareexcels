# 🔍 DEBUGGING INSTRUCTIONS

## How to Debug Why Changes Aren't Being Detected

### Step 1: Open Browser Console
1. Open your browser to http://localhost:5173/
2. Press **F12** to open Developer Tools
3. Click on the **Console** tab

### Step 2: Upload Your Files
1. Upload your old Excel file
2. Upload your new Excel file
3. Click "Compare Files"

### Step 3: Check Console Output
After clicking "Compare Files", you'll see detailed debug information:

#### What to Look For:

**1. Column Detection:**
```
Old file columns: ["Seq.", "Description", "Quantity", "Unit Price", "Amount", ...]
Old file first row: { Seq.: "0001", Description: "WASHER TANK...", Quantity: "8 PCS", ... }

New file columns: ["Seq.", "Description", "Quantity", "Unit Price", "Amount", ...]
New file first row: { Seq.: "0001", Description: "WASHER TANK...", Quantity: "10 PCS", ... }
```

**Check:**
- ✓ Are the column names normalized correctly?
- ✓ Do you see "Seq.", "Description", "Quantity", "Unit Price", "Amount"?
- ✓ Are the values being read correctly?

**2. Change Detection:**
```
Change detected in Quantity: {
  old: "8 PCS",
  new: "10 PCS",
  oldNormalized: "8 PCS",
  newNormalized: "10 PCS"
}
```

**Check:**
- ✓ Are changes being detected?
- ✓ Do the normalized values look correct?
- ✓ Are numbers being compared properly?

**3. Comparison Summary:**
```
Comparison Results: {
  oldDataCount: 10,
  newDataCount: 10,
  canceled: 0,
  edited: 2,
  noChange: 8
}
```

**Check:**
- ✓ Does the count make sense?
- ✓ Are there items in each category?

---

## Common Issues and Solutions

### Issue 1: Column Names Not Matching
**Symptoms:** Console shows wrong column names like "Seq" instead of "Seq."

**Solution:** The column normalization needs adjustment. Please share the exact column names from your Excel file.

### Issue 2: Values Not Being Compared
**Symptoms:** No "Change detected" messages in console, but you know there are changes

**Possible Causes:**
1. **Whitespace differences:** "8 PCS" vs "8  PCS" (extra space)
2. **Number format:** "14.8" vs "14.80"
3. **Data type:** Number 8 vs String "8"

**What to check:** Look at the first row output and see exactly how values appear

### Issue 3: All Items Show as "Canceled"
**Symptoms:** Everything appears in Canceled Items

**Possible Causes:**
1. Seq. or Description columns not found
2. Column name mismatch between files
3. Values in Seq./Description are different format

**What to check:** Compare the column names and first row from both files

### Issue 4: All Items Show as "Edited"
**Symptoms:** Even identical items appear as edited

**Possible Causes:**
1. Hidden characters in data
2. Number format differences
3. Trailing spaces

**What to check:** Look at the normalized values in the "Change detected" messages

---

## What to Share for Help

If changes aren't being detected, please share:

1. **Screenshot of console output** showing:
   - Old file columns
   - New file columns
   - First row from each file
   - Comparison Results summary

2. **Sample of your actual data** (just 1-2 rows):
   ```
   From old file:
   Seq.: _____
   Description: _____
   Quantity: _____
   Unit Price: _____
   Amount: _____

   From new file:
   Seq.: _____
   Description: _____
   Quantity: _____
   Unit Price: _____
   Amount: _____
   ```

3. **What changes you expect to see** but aren't appearing

---

## Testing Right Now

Your app is running at: **http://localhost:5173/**

1. Open it
2. Open console (F12)
3. Upload both files
4. Click Compare
5. Share what you see in the console!

This will help us identify exactly why the comparison isn't working correctly.
