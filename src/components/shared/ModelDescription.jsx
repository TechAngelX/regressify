// src/components/shared/ModelDescription.jsx
import React, { useState } from 'react';

const ModelDescription = ({ title, math, desc, when, howItWorks, realExample, pros, cons, color }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-2xl font-bold" style={{ color }}>
            {title}
          </h2>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded border border-gray-200">
            {math}
          </span>
        </div>
        <button 
          onClick={() => setShowDetails(!showDetails)} 
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
        >
          {showDetails ? '- Hide Details' : '+ Show Details'}
        </button>
      </div>

      <p className="text-gray-700 text-lg mb-3">{desc}</p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
        <p className="text-sm font-semibold text-blue-900">Best used:</p>
        <p className="text-blue-800">{when}</p>
      </div>

      {showDetails && (
        <div className="mt-6 space-y-4 border-t pt-6">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-2">How It Works</h3>
            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: howItWorks }}></p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-2">Real-World Example</h3>
            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: realExample }}></p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 h-full flex flex-col">
              <h3 className="font-bold text-green-800 mb-2">Pros</h3>
              <ul className="text-sm text-green-900 space-y-1 flex-grow">
                {pros.map((pro, idx) => <li key={idx}>&bull; {pro}</li>)}
              </ul>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 h-full flex flex-col">
              <h3 className="font-bold text-red-800 mb-2">Cons</h3>
              <ul className="text-sm text-red-900 space-y-1 flex-grow">
                {cons.map((con, idx) => <li key={idx}>&bull; {con}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelDescription;
