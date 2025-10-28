# Quick Reference Card

## 📋 Accurate Comparison Logic

### 🔑 Matching Keys (Must Both Match):
- **Seq.** ⭐ (Sequence number)
- **Description** ⭐ (Item description)
- **Both must be identical** for rows to be considered the "same item"

### ✅ Values Checked for Changes:
- **Quantity** (or Qty) - Checked AFTER matching
- **Unit Price** - Checked AFTER matching
- **Amount** - Checked AFTER matching

### ❌ These columns are IGNORED:
- Terms
- Comments
- Notes
- Any other columns

---

## 🎯 The Three Results

| Button | Icon | Color | Shows |
|--------|------|-------|-------|
| **Canceled Items** | 🗑️ | Red | Seq. + Description NOT found in new file |
| **Edited Items** | ✏️ | Orange | Seq. + Description match, but Qty/Price/Amount changed |
| **No Change** | ✅ | Green | Seq. + Description match, and all values identical |

---

## 🔍 Visual Indicators

### In "Edited Items" view:
- **📋 Old** badge = Original values (yellow row)
- **✨ New** badge = Updated values (blue row)
- **Red cell with ✎** = This value changed

---

## 📝 Example from Your Screenshot

```
Old File:
Seq: 0001
Description: WASHER TANK W/MOTOR CHR 18
Quantity: 8 PCS
Unit Price: 14.80
Amount: 118.40
```

### Scenario 1: Values Changed
```
New File:
Seq: 0001                            ← SAME (matches)
Description: WASHER TANK W/MOTOR CHR 18  ← SAME (matches)
Quantity: 10 PCS                     ← CHANGED
Unit Price: 14.80                    ← SAME
Amount: 148.00                       ← CHANGED
```
**Result:** ✏️ Shows in **Edited Items**
- Seq. + Description match → Same item found
- Quantity and Amount different → Highlighted in red with ✎

### Scenario 2: Item Deleted
```
New File:
(This Seq. + Description combination doesn't exist)
```
**Result:** 🗑️ Shows in **Canceled Items**
- Seq. "0001" + Description "WASHER TANK..." not found in new file

### Scenario 3: No Changes
```
New File:
Seq: 0001                            ← SAME
Description: WASHER TANK W/MOTOR CHR 18  ← SAME
Quantity: 8 PCS                      ← SAME
Unit Price: 14.80                    ← SAME
Amount: 118.40                       ← SAME
```
**Result:** ✅ Shows in **No Change**
- Everything matches perfectly

---

## 🚀 Quick Start (3 Steps)

1. **Upload** → Choose Old file, then New file
2. **Compare** → Click "Compare Files" button
3. **Review** → Click any colored button to see results

---

## 💡 Pro Tips

✓ BOTH Seq. AND Description must match exactly (case-sensitive)
✓ Remove extra spaces from your data
✓ Use consistent number formatting
✓ .xlsx files work best
✓ Mobile-friendly interface
✓ Only Quantity, Unit Price, and Amount are checked for changes

---

## 🎨 Color Guide

| Color | Meaning |
|-------|---------|
| 🔴 Red | Deleted items / Changed cells |
| 🟠 Orange | Modified items |
| 🟢 Green | No changes |
| 🟡 Yellow | Old version (in edited view) |
| 🔵 Blue | New version (in edited view) |

---

## 🔑 Critical Understanding

**Matching Process:**
1. Find rows where Seq. + Description are BOTH the same
2. For matched rows, check if Qty, Unit Price, or Amount changed
3. If Seq. + Description combo not found → Canceled
4. If found but values changed → Edited
5. If found and values same → No Change

**Remember**: Rows are matched by **BOTH Seq. AND Description together!**
