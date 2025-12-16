// src/components/shared/ParameterCard.jsx
import React from 'react';

const ParameterCard = ({ param, color }) => (
  <div 
    className="bg-white p-4 rounded-xl shadow-md border-l-4 flex flex-col justify-center transition-all hover:shadow-lg" 
    style={{ borderColor: color }}
  >
    <div className="flex justify-between items-center mb-1">
      <div className="flex items-center gap-2">
        <span className="font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-bold border border-gray-200">
          {param.symbol}
        </span>
        <span className="text-gray-700 font-bold uppercase tracking-wider text-xs">
          {param.name}
        </span>
      </div>
      <span className="font-mono font-bold text-xl" style={{ color }}>
        {param.value}
      </span>
    </div>
    <p className="text-gray-500 text-sm mt-1 border-t pt-2 border-gray-100 italic">
      "{param.context}"
    </p>
  </div>
);

export default ParameterCard;
