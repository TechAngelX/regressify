// src/components/shared/Tooltips.jsx
import React from 'react';

export const RegressionTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isOutlier = data.isOutlier;

    return (
      <div className={`p-4 rounded-lg shadow-xl border-2 z-50 ${isOutlier ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
        <p className="font-bold text-gray-800 mb-1">{label} years experience</p>
        <p className={`${isOutlier ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
          Actual: £{Math.round(data.actual)}k
        </p>
        <p className="text-indigo-600 font-semibold">
          Predicted: £{Math.round(data.predicted)}k
        </p>
        {isOutlier && (
          <div className="mt-2 pt-2 border-t border-red-200">
            <p className="text-xs font-bold text-red-800 uppercase tracking-wide">Outlier Detected</p>
            <p className="text-sm text-red-700 italic mt-1 max-w-[200px]">"{data.label}"</p>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const ClassificationTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={`p-4 rounded-lg shadow-xl border-2 z-50 ${data.hired ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <p className="font-bold text-gray-800 mb-1">{data.experience} years exp, {data.skillScore} skill</p>
        <p className={`font-bold ${data.hired ? 'text-green-600' : 'text-red-600'}`}>
          {data.label}
        </p>
      </div>
    );
  }
  return null;
};
