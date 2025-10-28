import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './index.css';

interface ExcelRow {
  [key: string]: string | number | boolean | null | undefined;
}

interface ComparisonResult {
  canceled: ExcelRow[];
  edited: ExcelRow[];
  noChange: ExcelRow[];
}

const Dashboard: React.FC = () => {
  const [oldFile, setOldFile] = useState<File | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [activeView, setActiveView] = useState<'canceled' | 'edited' | 'noChange' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (file: File, type: 'old' | 'new') => {
    if (type === 'old') {
      setOldFile(file);
    } else {
      setNewFile(file);
    }
    // Reset results when new file is uploaded
    setComparisonResult(null);
    setActiveView(null);
  };

  const readExcelFile = (file: File): Promise<ExcelRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData as ExcelRow[]);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };

  const normalizeColumnName = (name: string): string => {
    // Normalize column names to handle variations
    const normalized = name.trim().toLowerCase();
    if (normalized.includes('seq')) return 'Seq.';
    if (normalized.includes('description')) return 'Description';
    if (normalized.includes('qty') || normalized.includes('quantity')) return 'Quantity';
    if (normalized.includes('unit') && normalized.includes('price')) return 'Unit Price';
    if (normalized.includes('amount')) return 'Amount';
    return name;
  };

  const normalizeData = (data: ExcelRow[]): ExcelRow[] => {
    return data.map(row => {
      const normalizedRow: ExcelRow = {};
      Object.keys(row).forEach(key => {
        const normalizedKey = normalizeColumnName(key);
        normalizedRow[normalizedKey] = row[key];
      });
      return normalizedRow;
    });
  };

  const compareExcelFiles = async () => {
    if (!oldFile || !newFile) {
      alert('Please upload both Excel files');
      return;
    }

    setIsLoading(true);
    try {
      const oldDataRaw = await readExcelFile(oldFile);
      const newDataRaw = await readExcelFile(newFile);

      // Normalize column names
      const oldData = normalizeData(oldDataRaw);
      const newData = normalizeData(newDataRaw);

      const canceled: ExcelRow[] = [];
      const edited: ExcelRow[] = [];
      const noChange: ExcelRow[] = [];

      // Columns to compare (excluding comments and other fields)
      const columnsToCompare = ['Seq.', 'Description', 'Quantity', 'Unit Price', 'Amount'];

      // Create a map of new data using Description as the key
      const newDataMap = new Map<string, ExcelRow>();
      newData.forEach(row => {
        const description = row['Description'];
        if (description) {
          newDataMap.set(String(description), row);
        }
      });

      // Compare old data with new data based on Description
      oldData.forEach(oldRow => {
        const description = oldRow['Description'];
        if (!description) return; // Skip rows without description

        const newRow = newDataMap.get(String(description));

        if (!newRow) {
          // Item exists in old but not in new - CANCELED
          canceled.push(oldRow);
        } else {
          // Check if any of the important values changed
          const hasChanges = columnsToCompare.some(col => {
            const oldValue = oldRow[col];
            const newValue = newRow[col];
            
            // Convert to string for comparison to handle numbers and strings
            const oldStr = oldValue != null ? String(oldValue).trim() : '';
            const newStr = newValue != null ? String(newValue).trim() : '';
            
            return oldStr !== newStr;
          });

          if (hasChanges) {
            // Add both old and new for comparison
            edited.push({ ...oldRow, _status: 'OLD', _changeType: 'Modified' });
            edited.push({ ...newRow, _status: 'NEW', _changeType: 'Modified' });
          } else {
            noChange.push(oldRow);
          }
          
          // Remove from map to track items processed
          newDataMap.delete(String(description));
        }
      });

      // Any remaining items in newDataMap are new items (exist in new but not in old)
      // You can handle these as new additions if needed
      newDataMap.forEach((row) => {
        // Optionally add new items to a separate category or ignore them
        // For now, we'll ignore items that only exist in the new file
      });

      setComparisonResult({ canceled, edited, noChange });
      setIsLoading(false);
    } catch (error) {
      console.error('Error comparing files:', error);
      alert('Error processing Excel files. Please ensure they are valid Excel files.');
      setIsLoading(false);
    }
  };

  const renderTable = (data: ExcelRow[]) => {
    if (!data || data.length === 0) {
      return <div className="no-data">No items found in this category</div>;
    }

    const columns = Object.keys(data[0]);

    return (
      <div className="table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className={row._status && typeof row._status === 'string' ? `row-${row._status.toLowerCase()}` : ''}>
                {columns.map((col) => (
                  <td key={col}>{String(row[col] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="dashboard">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="navbar-title">Excel Comparisons</span>
          </div>
          <div className="navbar-menu">
            <button className="nav-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
            <button className="nav-btn active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Comparisons
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content">
        <header className="page-header">
          <h1>Excel File Comparison Tool</h1>
          <p>Upload two Excel files to compare and analyze differences</p>
        </header>

        {/* Upload Section */}
        <div className="upload-section">
          <div className="upload-card">
            <div className="upload-icon old">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3>Old Excel File</h3>
            <p className="upload-description">Upload the original Excel file</p>
            <label className="upload-btn">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'old')}
              />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Choose File
            </label>
            {oldFile && (
              <div className="file-info">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {oldFile.name}
              </div>
            )}
          </div>

          <div className="upload-card">
            <div className="upload-icon new">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3>New Excel File</h3>
            <p className="upload-description">Upload the updated Excel file</p>
            <label className="upload-btn">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'new')}
              />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Choose File
            </label>
            {newFile && (
              <div className="file-info">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {newFile.name}
              </div>
            )}
          </div>
        </div>

        {/* Compare Button */}
        {oldFile && newFile && !comparisonResult && (
          <div className="compare-button-container">
            <button 
              className="compare-btn" 
              onClick={compareExcelFiles}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Compare Files
                </>
              )}
            </button>
          </div>
        )}

        {/* Filter Buttons */}
        {comparisonResult && (
          <>
            <div className="filter-section">
              <button
                className={`filter-btn canceled ${activeView === 'canceled' ? 'active' : ''}`}
                onClick={() => setActiveView('canceled')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="filter-label">Canceled Items</span>
                <span className="filter-count">{comparisonResult.canceled.length}</span>
              </button>

              <button
                className={`filter-btn edited ${activeView === 'edited' ? 'active' : ''}`}
                onClick={() => setActiveView('edited')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="filter-label">Edited Items</span>
                <span className="filter-count">{comparisonResult.edited.length / 2}</span>
              </button>

              <button
                className={`filter-btn nochange ${activeView === 'noChange' ? 'active' : ''}`}
                onClick={() => setActiveView('noChange')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="filter-label">No Change</span>
                <span className="filter-count">{comparisonResult.noChange.length}</span>
              </button>
            </div>

            {/* Results Table */}
            {activeView && (
              <div className="results-section">
                <div className="results-header">
                  <h2>
                    {activeView === 'canceled' && 'Canceled Items'}
                    {activeView === 'edited' && 'Edited Items (Old → New)'}
                    {activeView === 'noChange' && 'Items with No Change'}
                  </h2>
                </div>
                {renderTable(comparisonResult[activeView])}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;