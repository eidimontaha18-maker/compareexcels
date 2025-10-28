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
          
          // First read all data as arrays to find header row and handle columns without headers
          const allData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as unknown[][];
          
          // Find which row has the headers (Seq., Description, etc.)
          let headerRowIndex = -1;
          for (let i = 0; i < Math.min(allData.length, 30); i++) {
            const row = allData[i] as string[];
            const rowStr = row.map(cell => String(cell || '').toLowerCase()).join(' ');
            if (rowStr.includes('seq') && rowStr.includes('desc')) {
              headerRowIndex = i;
              console.log(`Found header at row ${i + 1}:`, row);
              break;
            }
          }
          
          if (headerRowIndex === -1) {
            // If no header found, read normally
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            resolve(jsonData as ExcelRow[]);
          } else {
            // Manually parse data to handle columns without headers
            const headerRow = allData[headerRowIndex] as string[];
            const dataRows = allData.slice(headerRowIndex + 1);
            
            // Create column names, filling in blanks with positional names
            const columnNames = headerRow.map((header) => {
              const headerStr = String(header || '').trim();
              if (headerStr === '') {
                // Empty header - determine position relative to known columns
                // The empty column is between Description (index 1-2) and Quantity (index 3-4)
                return 'Code';
              }
              return headerStr;
            });
            
            console.log('Column names:', columnNames);
            
            // Convert array rows to objects
            const jsonData = dataRows
              .filter(row => {
                // Skip empty rows
                const hasData = (row as unknown[]).some(cell => cell != null && String(cell).trim() !== '');
                return hasData;
              })
              .map((row) => {
                const obj: ExcelRow = {};
                (row as unknown[]).forEach((cell, index) => {
                  const colName = columnNames[index] || `Column${index}`;
                  // Convert cell to string/number/boolean or empty string
                  const cellValue = cell != null ? cell : '';
                  obj[colName] = typeof cellValue === 'object' ? String(cellValue) : cellValue;
                });
                return obj;
              });
            
            console.log(`Read ${jsonData.length} data rows starting from row ${headerRowIndex + 1}`);
            console.log('Sample row:', jsonData[0]);
            resolve(jsonData as ExcelRow[]);
          }
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
    const normalized = name.trim().toLowerCase().replace(/\s+/g, ' ');
    
    // Handle __EMPTY columns by position (Excel with no headers)
    if (normalized.includes('__empty') || normalized === '') {
      // The column without a header is the CODE column (part numbers)
      // It appears between Description and Quantity in the Excel file
      return 'Code';
    }
    
    // Check for Seq variations
    if (normalized.includes('seq')) return 'Seq.';
    
    // Check for Description variations
    if (normalized.includes('description') || normalized.includes('desc')) return 'Description';
    
    // Check for Quantity variations
    if (normalized.includes('qty') || normalized.includes('quantity')) return 'Quantity';
    
    // Check for Unit Price variations
    if ((normalized.includes('unit') && normalized.includes('price')) || 
        normalized.includes('unitprice') ||
        normalized === 'price') return 'Unit Price';
    
    // Check for Amount variations
    if (normalized.includes('amount') || normalized.includes('total')) return 'Amount';
    
    return name;
  };

  const normalizeData = (data: ExcelRow[]): ExcelRow[] => {
    if (data.length === 0) return data;
    
    // Get all keys from the first row to determine positions
    const allKeys = Object.keys(data[0]);
    
    return data.map(row => {
      const normalizedRow: ExcelRow = {};
      allKeys.forEach((key) => {
        const normalizedKey = normalizeColumnName(key);
        normalizedRow[normalizedKey] = row[key];
      });
      return normalizedRow;
    });
  };

  const normalizeValue = (value: string | number | boolean | null | undefined): string => {
    // Handle null, undefined, or empty
    if (value == null || value === '') return '';
    
    // Convert to string and trim
    let strValue = String(value).trim();
    
    // Handle empty after trim
    if (strValue === '') return '';
    
    // Remove multiple spaces
    strValue = strValue.replace(/\s+/g, ' ');
    
    // Try to extract numbers from strings like "8 PCS" -> "8"
    // This helps compare "8 PCS" with "8"
    const numberMatch = strValue.match(/^([\d.,]+)/);
    if (numberMatch) {
      const numStr = numberMatch[1].replace(/,/g, '');
      const numValue = parseFloat(numStr);
      if (!isNaN(numValue)) {
        // For pure numbers or numbers with units, normalize the number part
        // Keep the unit if it exists
        const unit = strValue.substring(numberMatch[0].length).trim();
        if (unit) {
          return `${numValue} ${unit}`;
        }
        return numValue.toString();
      }
    }
    
    // For pure numbers without units
    const numValue = parseFloat(strValue);
    if (!isNaN(numValue) && strValue.match(/^[\d.,]+$/)) {
      return numValue.toString();
    }
    
    return strValue;
  };

  const createCompositeKey = (row: ExcelRow): string => {
    // Create a unique key using both Seq. and Description
    const seq = row['Seq.'] != null ? String(row['Seq.']).trim() : '';
    const description = row['Description'] != null ? String(row['Description']).trim() : '';
    return `${seq}|||${description}`; // Using ||| as separator to avoid conflicts
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

      // Debug: Show what columns we found
      if (oldData.length > 0) {
        console.log('===== OLD FILE =====');
        console.log('Old file columns:', Object.keys(oldData[0]));
        console.log('Old file first row:', oldData[0]);
        console.log('Old file row 5:', oldData[4]); // Check a few rows
        console.log('Old file row 10:', oldData[9]);
      } else {
        console.error('Old file has no data!');
        alert('Old file has no data rows!');
      }
      if (newData.length > 0) {
        console.log('===== NEW FILE =====');
        console.log('New file columns:', Object.keys(newData[0]));
        console.log('New file first row:', newData[0]);
        console.log('New file row 5:', newData[4]);
        console.log('New file row 10:', newData[9]);
      } else {
        console.error('New file has no data!');
        alert('New file has no data rows!');
      }

      const canceled: ExcelRow[] = [];
      const edited: ExcelRow[] = [];
      const noChange: ExcelRow[] = [];

      // Columns to check for changes (NOT including Seq. and Description)
      // Seq. and Description must match for the row to be considered the same item
      const columnsToCompare = ['Quantity', 'Unit Price', 'Amount'];

      // Create a map of new data using BOTH Seq. AND Description as composite key
      const newDataMap = new Map<string, ExcelRow>();
      newData.forEach((row, index) => {
        const seq = row['Seq.'];
        const description = row['Description'];
        
        console.log(`New file row ${index}:`, { seq, description });
        
        // Only add to map if both Seq. and Description exist
        if (seq != null && description != null) {
          const key = createCompositeKey(row);
          console.log(`Created key for new row ${index}:`, key);
          newDataMap.set(key, row);
        } else {
          console.warn(`Skipping new row ${index} - missing Seq. or Description`, row);
        }
      });
      
      console.log('Total rows in newDataMap:', newDataMap.size);

      // Compare old data with new data based on BOTH Seq. AND Description
      oldData.forEach((oldRow, index) => {
        const seq = oldRow['Seq.'];
        const description = oldRow['Description'];
        
        console.log(`Old file row ${index}:`, { seq, description });
        
        // Skip rows without both Seq. and Description
        if (seq == null || description == null) {
          console.warn(`Skipping old row ${index} - missing Seq. or Description`, oldRow);
          return;
        }

        const key = createCompositeKey(oldRow);
        console.log(`Looking for key:`, key);
        const newRow = newDataMap.get(key);
        console.log(`Found match:`, newRow ? 'YES' : 'NO');

        if (!newRow) {
          // Item with same Seq. AND Description not found in new file - CANCELED
          canceled.push(oldRow);
        } else {
          // Item found - now check if Quantity, Unit Price, or Amount changed
          const hasChanges = columnsToCompare.some(col => {
            const oldValue = oldRow[col];
            const newValue = newRow[col];
            
            // Normalize both values for accurate comparison
            const oldNormalized = normalizeValue(oldValue);
            const newNormalized = normalizeValue(newValue);
            
            // Debug: Log comparison if values differ
            if (oldNormalized !== newNormalized) {
              console.log(`Change detected in ${col}:`, {
                old: oldValue,
                new: newValue,
                oldNormalized,
                newNormalized
              });
            }
            
            return oldNormalized !== newNormalized;
          });

          if (hasChanges) {
            // At least one of Quantity, Unit Price, or Amount changed
            edited.push({ ...oldRow, _status: 'OLD', _changeType: 'Modified' });
            edited.push({ ...newRow, _status: 'NEW', _changeType: 'Modified' });
          } else {
            // Seq., Description, Quantity, Unit Price, and Amount all match
            noChange.push(oldRow);
          }
          
          // Remove from map to track items processed
          newDataMap.delete(key);
        }
      });

      // Debug: Log summary
      console.log('Comparison Results:', {
        oldDataCount: oldData.length,
        newDataCount: newData.length,
        canceled: canceled.length,
        edited: edited.length / 2,
        noChange: noChange.length
      });

      // Any remaining items in newDataMap are new items (exist in new but not in old)
      // For now, we'll ignore items that only exist in the new file

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

    // Filter out internal columns like _status and _changeType
    const allColumns = Object.keys(data[0]);
    const columns = allColumns.filter(col => !col.startsWith('_'));

    // For edited items, we need to compare pairs
    const isEditedView = activeView === 'edited';

    const getCellClassName = (row: ExcelRow, col: string, nextRow?: ExcelRow): string => {
      if (!isEditedView || !nextRow) return '';
      
      // Compare this row with the next row (OLD vs NEW pair)
      const isOldRow = row._status === 'OLD';
      if (!isOldRow) return '';

      const oldValue = String(row[col] ?? '').trim();
      const newValue = String(nextRow[col] ?? '').trim();

      return oldValue !== newValue ? 'cell-changed' : '';
    };

    return (
      <div className="table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              {isEditedView && <th className="status-column">Status</th>}
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const nextRow = data[index + 1];
              const rowClassName = row._status && typeof row._status === 'string' 
                ? `row-${row._status.toLowerCase()}` 
                : '';

              return (
                <tr key={index} className={rowClassName}>
                  {isEditedView && (
                    <td className="status-column">
                      <span className={`status-badge ${typeof row._status === 'string' ? row._status.toLowerCase() : ''}`}>
                        {row._status === 'OLD' ? '📋 Old' : '✨ New'}
                      </span>
                    </td>
                  )}
                  {columns.map((col) => (
                    <td 
                      key={col} 
                      className={getCellClassName(row, col, nextRow)}
                    >
                      {String(row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })}
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
          <p>Compare files by matching Seq. + Description, then check for changes in Quantity, Unit Price, and Amount</p>
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

        {/* Comparison Summary */}
        {comparisonResult && (
          <div className="summary-card">
            <div className="summary-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3>Comparison Complete! ✨</h3>
            <p>Files compared using <strong>Seq. + Description</strong> as matching keys. Changes detected in <strong>Quantity, Unit Price, and Amount</strong>.</p>
            <div className="summary-stats">
              <div className="summary-stat">
                <span className="stat-number canceled-color">{comparisonResult.canceled.length}</span>
                <span className="stat-text">Deleted</span>
              </div>
              <div className="summary-stat">
                <span className="stat-number edited-color">{comparisonResult.edited.length / 2}</span>
                <span className="stat-text">Modified</span>
              </div>
              <div className="summary-stat">
                <span className="stat-number nochange-color">{comparisonResult.noChange.length}</span>
                <span className="stat-text">Unchanged</span>
              </div>
            </div>
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
                    {activeView === 'canceled' && '🗑️ Canceled Items'}
                    {activeView === 'edited' && '✏️ Edited Items'}
                    {activeView === 'noChange' && '✅ Items with No Change'}
                  </h2>
                  <p className="results-description">
                    {activeView === 'canceled' && 
                      'Items where BOTH Seq. AND Description from the old file are not found in the new file (deleted/canceled items).'}
                    {activeView === 'edited' && 
                      'Items with the SAME Seq. and Description, but with changes in Quantity, Unit Price, or Amount. Changed values are highlighted in red with ✎.'}
                    {activeView === 'noChange' && 
                      'Items where Seq., Description, Quantity, Unit Price, AND Amount all remain identical in both files.'}
                  </p>
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