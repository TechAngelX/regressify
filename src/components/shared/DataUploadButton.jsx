import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

// NOTE: If using the public folder, we do not need to import the image.
// We will reference it directly by string in the <img> tag below.

const DataUploadButton = ({ onUpload }) => {
    const fileInputRef = useRef(null);
    const [error, setError] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const processRawData = (rows) => {
        const cleanRows = rows.filter(row => row && row.length > 0);
        if (cleanRows.length < 2) throw new Error("File is too short (needs header + data).");

        const headers = cleanRows[0].map(h => String(h).trim());
        const dataRows = cleanRows.slice(1);
        const numericIndices = [];
        const firstRowData = dataRows[0];

        firstRowData.forEach((val, index) => {
            const num = parseFloat(val);
            if (!isNaN(num) && isFinite(num)) numericIndices.push(index);
        });

        if (numericIndices.length < 2) throw new Error("Could not find 2 numeric columns for X and Y variables.");

        const xIndex = numericIndices[0];
        const yIndex = numericIndices[1];
        const cleanData = [];

        dataRows.forEach((row) => {
            if (row[xIndex] === undefined || row[yIndex] === undefined) return;
            const xVal = parseFloat(row[xIndex]);
            const yVal = parseFloat(row[yIndex]);
            if (!isNaN(xVal) && !isNaN(yVal)) cleanData.push({ x: xVal, y: yVal });
        });

        if (cleanData.length < 3) throw new Error("Not enough valid data points (need at least 3).");

        return {
            data: cleanData,
            xLabel: headers[xIndex] || "X Value",
            yLabel: headers[yIndex] || "Y Value"
        };
    };

    const handleFileChange = async (event) => {
        setError(null);
        const file = event.target.files[0];
        if (!file) return;

        setFileName(file.name);

        try {
            const data = await file.arrayBuffer();
            // CRITICAL FIX: The { type: 'array' } option is required for binary Excel files!
            const workbook = XLSX.read(data, { type: 'array' });

            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const result = processRawData(jsonData);
            onUpload(result);
        } catch (err) {
            console.error(err);
            setError("Failed to parse file. Ensure it is a valid CSV or Excel file.");
            setFileName(null);
        }
        event.target.value = '';
    };

    return (
        <div className="relative flex flex-col items-end z-50">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv, .xlsx, .xls"
                className="hidden"
            />

            {showTooltip && (
                <div className="absolute bottom-full mb-3 right-0 w-80 p-4 bg-slate-900 text-slate-200 text-sm rounded-xl shadow-2xl border border-slate-700 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <h4 className="font-bold text-white mb-2 text-base">Data Format Guide</h4>
                    <p className="mb-3 text-slate-400 leading-relaxed text-xs">
                        Upload an Excel or CSV file. The first row must contain <strong>headers</strong>.
                        The first two <strong>numeric columns</strong> found will be used as your X and Y variables.
                    </p>

                    <div className="rounded-lg overflow-hidden border border-slate-600 mb-2 bg-white">
                        {/* FIX: Use path directly since it is in the public folder */}
                        <img
                            src="/images/dummyExample.png"
                            alt="Example: Row 1 has headers, Row 2+ has data."
                            className="w-full h-auto object-cover opacity-90"
                        />
                    </div>

                    <p className="mb-1 text-slate-400 leading-relaxed text-xs">
                        Example: X = TvAdBudget, Y = ProductSales
                    </p>
                    <p className="mb-3 text-slate-500 leading-relaxed text-[10px] italic">
                        (Tip: Add Units like £ or kg in the headers)
                    </p>

                    <div className="absolute -bottom-2 right-8 w-4 h-4 bg-slate-900 border-b border-r border-slate-700 transform rotate-45"></div>
                </div>
            )}

            <div
                className="flex items-center gap-2"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {fileName && <span className="text-xs text-slate-400 max-w-[100px] truncate">{fileName}</span>}

                <button
                    onClick={handleButtonClick}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-md transition-all text-sm font-medium whitespace-nowrap shadow-sm hover:shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="8" y1="13" x2="16" y2="13"></line>
                        <line x1="8" y1="17" x2="16" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    {fileName ? 'Change File' : 'Upload Data'}
                </button>
            </div>

            {error && (
                <span className="text-red-400 text-xs mt-1 bg-red-950/30 px-2 py-1 rounded border border-red-900/50">
                  {error}
                </span>
            )}
        </div>
    );
};

export default DataUploadButton;
