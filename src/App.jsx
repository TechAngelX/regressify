// src/App.jsx

import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import RegressionTab from './components/RegressionTab';
import ClassificationTab from './components/ClassificationTab';

const RegressifyLogo = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 130" fill="none" className={className}>
        <defs>
            <linearGradient id="pulse-grad" x1="0" y1="0" x2="110" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#a855f7"/>
            </linearGradient>
            <filter id="pulse-glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <g transform="translate(8, 16)">
            <path d="M5 44 L24 44 L36 64 L54 8 L72 52 L86 34 L112 34"
                  stroke="#6366f1" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.25" transform="translate(5, 5)"/>
            <path d="M5 44 L24 44 L36 64 L54 8 L72 52 L86 34 L112 34"
                  stroke="url(#pulse-grad)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#pulse-glow)"/>
            <circle cx="54" cy="8" r="8" fill="#a855f7" filter="url(#pulse-glow)"/>
        </g>
        <text x="142" y="58" fontFamily="'Outfit', sans-serif" fontWeight="600" fontSize="56" fill="currentColor" letterSpacing="-1">
            regressify
        </text>
        <text x="145" y="95" fontFamily="'Outfit', sans-serif" fontWeight="500" fontSize="17" fill="#6366f1" letterSpacing="2.5">
            INTERACTIVE ML VISUALISER
        </text>
    </svg>
);

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

const AppContent = () => {
    const [activeTab, setActiveTab] = useState('regression');
    const { isDark, bg, bgCard, text, textMuted, border } = useTheme();

    return (
        <div className={`w-full min-h-screen p-8 transition-colors duration-300 ${bg}`}>

            <div className="absolute top-4 left-4 flex items-center gap-3">
                <img src="/images/logo.png" alt="Tech Angel X Logo"
                     className="w-16 h-16 rounded-full shadow-lg border-2 border-white"/>
                <div className="text-sm">
                    <p className={`font-bold ${text}`}>Tech Angel X</p>
                    <p className={`text-xs ${textMuted}`}>by Ricki Angel</p>
                </div>
            </div>

            <div className="absolute top-4 right-4">
                <ThemeToggle/>
            </div>

            <div className="flex justify-center mt-2 mb-1">
                <RegressifyLogo className={`w-[600px] h-auto ${text}`}/>
            </div>

            <div className="max-w-2xl mx-auto text-center mb-4 space-y-3">
                <p className={textMuted}>
                    Training a machine learning model is a balancing act — too simple and you miss the pattern, too
                    complex and you chase noise. The same data can reveal wildly different patterns depending on the
                    algorithm.
                </p>
                <p className={`font-medium ${textMuted}`}>
                    This self-contained web application lets you explore how various models — from straightforward
                    linear fits to complex neural networks — interpret patterns in your data.
                </p>
            </div>
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

            {activeTab === 'regression' && <RegressionTab/>}
            {activeTab === 'classification' && <ClassificationTab/>}

            <div className={`mt-12 text-center pb-8 border-t pt-6 ${border}`}>
                <p className={`text-sm ${textMuted}`}>
                    {new Date().getFullYear()} <span className="font-semibold">Ricki Angel</span> | <span
                    className="font-semibold text-indigo-500">Tech Angel X</span>
                </p>
                <p className={`text-xs mt-1 ${textMuted}`}>
                    Interactive ML Visualisation Tool
                </p>
            </div>
        </div>
    );
};

function App() {
    return (
        <ThemeProvider>
            <AppContent/>
        </ThemeProvider>
    );
}

export default App;
