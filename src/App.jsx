// src/App.jsx
import React, { useState } from 'react';
import RegressionTab from './components/RegressionTab';
import ClassificationTab from './components/ClassificationTab';

function App() {
  const [activeTab, setActiveTab] = useState('regression');

  return (
    <div className="w-full min-h-screen p-8 bg-gradient-to-br from-slate-50 to-indigo-50">

      {/* LOGO & BRANDING */}
      <div className="absolute top-4 left-4 flex items-center gap-3">
        <img src="/images/logo.png" alt="Tech Angel X Logo" className="w-16 h-16 rounded-full shadow-lg border-2 border-white" />
        <div className="text-sm">
          <p className="font-bold text-gray-800">Tech Angel X</p>
          <p className="text-gray-600 text-xs">by Ricki Angel</p>
        </div>
      </div>

      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold text-center mb-2 text-gray-800 mt-12">Salary Prediction: ML Methods Compared</h1>
      <div className="max-w-2xl mx-auto text-center mb-6">
        <p className="text-gray-600 mb-2">Training a machine learning model isn't one-size-fits-all. Depending on your data, you might need the strict logic of a flowchart or the complex intuition of a neural network.</p>
        <p className="text-gray-600 font-medium">I created this cheat sheet to explore how different algorithms "think" about the same data.</p>
      </div>

      {/* TAB NAVIGATION */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-center">
          <div className="inline-flex bg-white rounded-xl p-1.5 shadow-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('regression')}
              className={`px-8 py-3 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'regression'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              📈 Regression
            </button>
            <button
              onClick={() => setActiveTab('classification')}
              className={`px-8 py-3 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'classification'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              🏷️ Classification
            </button>
          </div>
        </div>
        <p className="text-center text-gray-500 text-sm mt-3">
          {activeTab === 'regression' 
            ? 'Predicting continuous values (e.g., salary in £)' 
            : 'Predicting categories (e.g., Hired vs Rejected)'}
        </p>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'regression' && <RegressionTab />}
      {activeTab === 'classification' && <ClassificationTab />}

      {/* FOOTER */}
      <div className="mt-12 text-center pb-8 border-t border-gray-300 pt-6">
        <p className="text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} <span className="font-semibold">Ricki Angel</span> | <span className="font-semibold text-indigo-600">Tech Angel X</span>
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Interactive ML Visualisation Tool
        </p>
      </div>
    </div>
  );
}

export default App;
