# Sample Excel Files for Testing

If you don't have Excel files ready for testing, you can create sample files using Excel or Google Sheets with the following structure:

## Old Excel File (sample_old.xlsx)

| ID | Product Name | Quantity | Price | Status |
|----|-------------|----------|-------|---------|
| 1  | Laptop      | 10       | 999   | Active  |
| 2  | Mouse       | 50       | 25    | Active  |
| 3  | Keyboard    | 30       | 75    | Active  |
| 4  | Monitor     | 15       | 299   | Active  |
| 5  | Headphones  | 25       | 89    | Active  |

## New Excel File (sample_new.xlsx)

| ID | Product Name | Quantity | Price | Status |
|----|-------------|----------|-------|---------|
| 1  | Laptop      | 15       | 999   | Active  |
| 2  | Mouse       | 50       | 25    | Active  |
| 4  | Monitor     | 15       | 349   | Updated |
| 5  | Headphones  | 25       | 89    | Active  |
| 6  | Webcam      | 20       | 129   | New     |

## Expected Results

When you compare these files:

### Canceled Items (1 item)
- ID 3: Keyboard - This item exists in old but not in new file

### Edited Items (2 items)
- ID 1: Laptop - Quantity changed from 10 to 15
- ID 4: Monitor - Price changed from 299 to 349, Status changed from Active to Updated

### No Change (2 items)
- ID 2: Mouse - No changes
- ID 5: Headphones - No changes

## Notes
- The first column (ID) is used as the unique identifier
- Make sure both files have the same column headers
- The comparison is case-sensitive
- Empty cells are treated as different from cells with values
