import React from 'react';
import { ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const RegressionChart = ({
                             chartData,
                             normalPoints,
                             outlierPoints,
                             scenario,
                             modelColor,
                             isManualMode
                         }) => {
    const { isDark, bgCard, chartGrid, chartAxis } = useTheme();

    const DynamicTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className={`p-4 rounded-lg shadow-xl border-2 z-50 ${data.isOutlier ? 'bg-red-900/90 border-red-500' : isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-100'}`}>
                    <p className={`font-bold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{scenario.xLabel}: {label}</p>
                    <p className={data.isOutlier ? 'text-red-300 font-bold' : isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Actual: {scenario.currency}{Math.round(data.actual)}{scenario.yUnit}
                    </p>
                    <p className="text-indigo-400 font-semibold">
                        Predicted: {scenario.currency}{Math.round(data.predicted)}{scenario.yUnit}
                    </p>
                    {data.isOutlier && (
                        <div className="mt-2 pt-2 border-t border-red-500">
                            <p className="text-xs font-bold text-red-300 uppercase tracking-wide">Outlier Detected</p>
                            <p className="text-sm text-red-200 italic mt-1 max-w-[200px]">"{data.label[scenario.name === 'Custom' ? 'custom' : Object.keys(data.label)[0]] || 'Outlier'}"</p>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className={`rounded-xl shadow-xl p-6 mb-6 ${bgCard}`}>
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                    <XAxis
                        dataKey="experience"
                        label={{ value: scenario.xLabel, position: 'insideBottom', offset: -10, fill: chartAxis }}
                        stroke={chartAxis}
                        type="number"
                        domain={['auto', 'auto']}
                    />
                    <YAxis
                        label={{ value: scenario.yLabel, angle: -90, position: 'insideLeft', offset: 0, fill: chartAxis }}
                        stroke={chartAxis}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip content={<DynamicTooltip />} cursor={{ stroke: chartGrid, strokeWidth: 2 }} />
                    <Scatter dataKey="actual" data={normalPoints} fill={isDark ? '#64748b' : '#94a3b8'} name="Normal" shape="circle" />
                    <Scatter dataKey="actual" data={outlierPoints} fill="#ef4444" name="Outliers" shape="circle" r={6} />
                    <Line
                        data={chartData}
                        type="monotone"
                        dataKey="predicted"
                        stroke={modelColor}
                        strokeWidth={3}
                        dot={false}
                        animationDuration={isManualMode ? 0 : 1200}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RegressionChart;
