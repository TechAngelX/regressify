// src/components/shared/MiniChart.jsx
import React from 'react';
import { ComposedChart, Line, Scatter, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext'; // Ensure correct path to ThemeContext

const MiniChart = ({ data, lineKey, color, title, desc, analogy }) => {
    // Optional: Use theme if you want the card background to adapt, 
    // but based on your screenshots, these cards are white in both modes within the container.
    // We keep it simple to match Goldilocks exactly.

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col h-full">
            <h4 className="text-center font-bold text-slate-700 mb-2">{title}</h4>

            <div className="h-32 w-full mb-3">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        {/* Tiny dots for scatter effect if data exists */}
                        <Scatter dataKey="actual" fill="#cbd5e1" r={2} />
                        <Line
                            type="monotone"
                            dataKey={lineKey}
                            stroke={color}
                            strokeWidth={3}
                            dot={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-auto">
                {desc && (
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {desc}
                    </p>
                )}

                {/* THIS WAS THE BUG: Now we check if 'analogy' exists before rendering the box */}
                {analogy && (
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <p className="text-[10px] text-slate-500 italic">
                            <span className="font-bold not-italic text-slate-600">Analogy: </span>
                            {analogy}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MiniChart;
