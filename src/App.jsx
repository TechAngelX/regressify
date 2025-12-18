import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import RegressionTab from './components/RegressionTab';
import ClassificationTab from './components/ClassificationTab';

// --- Internal Component: Theme Toggle Button ---
const ThemeToggle = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-lg transition-all ${
                isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400'
                    : 'bg-white hover:bg-gray-100 text-slate-700 shadow-md'
            }`}
            aria-label="Toggle dark mode"
        >
            {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
            )}
        </button>
    );
};

// --- Internal Component: Main Content Structure ---
const AppContent = () => {
    const [activeTab, setActiveTab] = useState('regression');
    const { isDark, bg, bgCard, text, textMuted, border } = useTheme();

    return (
        <div className={`w-full min-h-screen p-8 transition-colors duration-300 ${bg}`}>

            {/* LOGO & BRANDING */}
            <div className="absolute top-4 left-4 flex items-center gap-3">
                <img src="/images/logo.png" alt="Tech Angel X Logo" className="w-16 h-16 rounded-full shadow-lg border-2 border-white" />
                <div className="text-sm">
                    <p className={`font-bold ${text}`}>Tech Angel X</p>
                    <p className={`text-xs ${textMuted}`}>by Ricki Angel</p>
                </div>
            </div>

            {/* THEME TOGGLE */}
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            {/* PAGE TITLE */}
            <h1 className={`text-3xl font-bold text-center mb-2 mt-12 ${text}`}>Regressify: Interactive ML Visualiser</h1>
            <div className="max-w-2xl mx-auto text-center mb-6">
                <p className={`mb-2 ${textMuted}`}>Training a machine learning model isn't one-size-fits-all. Depending on your data, you might need the strict logic of a flowchart or the complex intuition of a neural network.</p>
                <p className={`font-medium ${textMuted}`}>Explore how different algorithms approach the same problem.</p>
            </div>

            {/* TAB NAVIGATION */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex justify-center">
                    <div className={`inline-flex rounded-xl p-1.5 shadow-lg border ${bgCard} ${border}`}>
                        <button
                            onClick={() => setActiveTab('regression')}
                            className={`px-8 py-3 rounded-lg font-bold text-sm transition-all ${
                                activeTab === 'regression'
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                                    : `${textMuted} ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'}`
                            }`}
                        >
                            Regression
                        </button>
                        <button
                            onClick={() => setActiveTab('classification')}
                            className={`px-8 py-3 rounded-lg font-bold text-sm transition-all ${
                                activeTab === 'classification'
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                                    : `${textMuted} ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'}`
                            }`}
                        >
                            Classification
                        </button>
                    </div>
                </div>
                <p className={`text-center text-sm mt-3 ${textMuted}`}>
                    {activeTab === 'regression'
                        ? 'Predicting continuous values (e.g., salary, price, height)'
                        : 'Predicting categories (e.g., yes/no, spam/not spam)'}
                </p>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'regression' && <RegressionTab />}
            {activeTab === 'classification' && <ClassificationTab />}

            {/* FOOTER */}
            <div className={`mt-12 text-center pb-8 border-t pt-6 ${border}`}>
                <p className={`text-sm ${textMuted}`}>
                    {new Date().getFullYear()} <span className="font-semibold">Ricki Angel</span> | <span className="font-semibold text-indigo-500">Tech Angel X</span>
                </p>
                <p className={`text-xs mt-1 ${textMuted}`}>
                    Interactive ML Visualisation Tool
                </p>
            </div>
        </div>
    );
};

// --- Root App Component ---
function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

export default App;
