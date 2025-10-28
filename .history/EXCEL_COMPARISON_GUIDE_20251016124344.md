# Excel Comparison Dashboard

A modern, responsive web application for comparing two Excel files and analyzing the differences between them.

## Features

- **Modern UI Design**: Beautiful gradient backgrounds, glass-morphism effects, and smooth animations
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Excel File Comparison**: Upload and compare two Excel files
- **Three Categories of Changes**:
  - **Canceled Items**: Items that exist in the old file but not in the new file
  - **Edited Items**: Items that have changes in any of their fields (shows both old and new versions)
  - **No Change**: Items that remain identical in both files
- **Interactive Results**: Click filter buttons to view specific categories
- **Modern Navigation**: Clean navigation bar with icons

## How to Use

1. **Start the Application**:
   ```bash
   npm run dev
   ```
   Then open your browser to `http://localhost:5173/`

2. **Upload Files**:
   - Click "Choose File" under "Old Excel File" to upload your original file
   - Click "Choose File" under "New Excel File" to upload your updated file
   - Supported formats: `.xlsx`, `.xls`, `.csv`

3. **Compare Files**:
   - Once both files are uploaded, click the "Compare Files" button
   - The system will process and analyze the differences

4. **View Results**:
   - Click on any of the three filter buttons:
     - **Canceled Items**: See items removed from the new file
     - **Edited Items**: See items with changes (old and new versions shown)
     - **No Change**: See items that remained the same
   - Each button shows a count of items in that category

## Technical Details

### Technologies Used
- React 19 with TypeScript
- Vite (build tool)
- XLSX library for Excel file processing
- Modern CSS with animations and gradients

### File Comparison Logic
- The system uses the **first column** as a unique identifier (ID)
- Compares each row between old and new files
- Detects additions, deletions, and modifications
- Provides visual indicators for different row types

### Styling Features
- Gradient backgrounds
- Glass-morphism cards
- Hover animations
- Color-coded filter buttons
- Responsive grid layouts
- Smooth transitions

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Dependencies

- `react`: ^19.1.1
- `react-dom`: ^19.1.1
- `xlsx`: For Excel file processing
- `@types/xlsx`: TypeScript definitions

## Browser Support

Works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Future Enhancements

Possible features to add:
- Export comparison results to Excel
- Support for multiple sheet comparison
- Advanced filtering options
- Customizable comparison criteria
- History of past comparisons
- Dark mode support

## License

MIT License

## Author

Created with ❤️ for efficient Excel file comparison
