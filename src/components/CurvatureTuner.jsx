// src/components/CurvatureTuner.js
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const CurvatureTuner = ({ w2, setW2 }) => {
    const { isDark } = useTheme();

    return (
        <div className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${
            isDark
                ? 'bg-indigo-950/50 border-indigo-800/50 text-indigo-300 shadow-sm'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
        } mr-4`}>
      <span className="text-xs font-bold uppercase tracking-wider">
        Curvature
      </span>

            {/* Slider */}
            <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={w2}
                onChange={(e) => setW2(parseFloat(e.target.value))}
                className={`w-24 h-2 rounded-lg appearance-none cursor-pointer transition-all ${
                    isDark ? 'bg-indigo-900' : 'bg-indigo-200'
                } accent-indigo-600 hover:accent-indigo-500`}
            />

            {/* Value Display */}
            <span className="text-sm font-mono font-bold min-w-[3ch] text-center">
        {w2.toFixed(1)}
      </span>
        </div>
    );
};

export default CurvatureTuner;
