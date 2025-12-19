// src/components/shared/CsvUploadButton.jsx
import React, { useRef, useState } from 'react';

const CsvUploadButton = ({ onUpload }) => {
    const fileInputRef = useRef(null);
    const [error, setError] = useState(null);

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const validateAndParseCSV = (csvText) => {
        const lines = csvText.split('\n').filter((line) => line.trim() !== '');

        if (lines.length < 2) {
            throw new Error('File is too short. Please include headers and at least one row of data.');
        }

        // Assume first row is headers
        const headers = lines[0].split(',').map((h) => h.trim());

        // Parse rows
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map((val) => val.trim());

            // Basic structure check
            if (values.length !== headers.length) {
                continue; // Skip malformed rows
            }

            // Numeric Validation: Check if X and Y values are actually numbers
            // Assuming a simple 2-column CSV for regression (X, Y)
            const x = parseFloat(values[0]);
            const y = parseFloat(values[1]);

            if (isNaN(x) || isNaN(y)) {
                throw new Error(`Row ${i + 1} contains non-numeric data. Regression requires numbers.`);
            }

            data.push({ x, y });
        }

        if (data.length === 0) {
            throw new Error('No valid data rows found.');
        }

        return data;
    };

    const handleFileChange = (event) => {
        setError(null);
        const file = event.target.files[0];
        if (!file) return;

        // 1. File Type Validation
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            setError('Invalid file type. Please upload a .csv file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const parsedData = validateAndParseCSV(text);
                onUpload(parsedData); // Send data back to parent

                // Reset input so same file can be selected again if needed
                event.target.value = '';
            } catch (err) {
                setError(err.message);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex flex-col items-end">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                style={{ display: 'none' }}
            />

            <button
                onClick={handleButtonClick}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all text-sm font-medium border border-slate-600"
            >
                {/* Simple Upload Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Upload CSV
            </button>

            {error && (
                <span className="text-red-400 text-xs mt-2 bg-red-900/20 px-2 py-1 rounded">
          {error}
        </span>
            )}
        </div>
    );
};

export default CsvUploadButton;
