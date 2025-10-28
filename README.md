# Compare Excels - Excel File Comparison Tool

A powerful React-based web application to compare two Excel files and identify differences between them.

## Features

- 📊 **Smart Comparison**: Matches items by Seq. + Description
- 🔍 **Change Detection**: Identifies changes in Quantity, Unit Price, and Amount
- 📋 **Three Categories**: 
  - **Deleted**: Items removed from the new file
  - **Modified**: Items with changed values
  - **Unchanged**: Items that remain identical
- 🎨 **Beautiful UI**: Modern, intuitive interface with visual highlighting
- ⚡ **Fast Processing**: Built with React + TypeScript + Vite
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **XLSX** library for Excel file processing
- Modern CSS with beautiful UI components

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/eidimontaha18-maker/compareExcels.git

# Navigate to project directory
cd compareExcels

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## How It Works

1. **Upload Files**: Upload your old and new Excel files
2. **Automatic Processing**: The tool automatically:
   - Detects headers (Seq., Description, Code, Quantity, Unit Price, Amount)
   - Handles variations in column names (Qty vs Quantity)
   - Normalizes values (removes "PCS" suffix, handles numeric comparisons)
3. **View Results**: Browse categorized results:
   - Items that were deleted
   - Items that were modified (with highlighted changes)
   - Items that remain unchanged

## Column Mapping

The tool automatically handles:
- **Seq** / **Seq.** → Sequence number
- **Description** / **Desc** → Item description
- **Code** → Part numbers (handles empty column headers)
- **Qty** / **Quantity** → Quantity (normalizes "8 PCS" to "8")
- **Unit Price** → Price per unit
- **Amount** → Total amount

## Documentation

- [User Guide](USER_GUIDE.md) - Detailed usage instructions
- [Excel Comparison Guide](EXCEL_COMPARISON_GUIDE.md) - Understanding the comparison logic
- [Quick Reference](QUICK_REFERENCE.md) - Quick tips and shortcuts

## License

MIT License

## Author

Created by Eidimontaha18
