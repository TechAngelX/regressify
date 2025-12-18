// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('regressify-theme');
            if (saved) return saved === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        localStorage.setItem('regressify-theme', isDark ? 'dark' : 'light');
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(prev => !prev);

    const theme = {
        isDark,
        toggleTheme,
        bg: isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-indigo-50',
        bgCard: isDark ? 'bg-slate-800' : 'bg-white',
        bgCardAlt: isDark ? 'bg-slate-700' : 'bg-gray-100',
        bgInput: isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300',
        text: isDark ? 'text-gray-100' : 'text-gray-800',
        textMuted: isDark ? 'text-gray-400' : 'text-gray-600',
        textSubtle: isDark ? 'text-gray-500' : 'text-gray-500',
        border: isDark ? 'border-slate-700' : 'border-slate-200',
        shadow: isDark ? 'shadow-lg shadow-black/20' : 'shadow-xl',
        chartGrid: isDark ? '#374151' : '#e5e7eb',
        chartAxis: isDark ? '#9ca3af' : '#6b7280',
        tooltipBg: isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-100',
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};
