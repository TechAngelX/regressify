// src/components/ClassificationTab.jsx
import React, { useState, useMemo } from 'react';
import { ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateClassificationData, classificationModels, classificationDescriptions, calculateBoundary } from '../data/classificationModels';
import { ClassificationTooltip } from './shared/Tooltips';
import ParameterCard from './shared/ParameterCard';
import ModelDescription from './shared/ModelDescription';

const ClassificationTab = () => {
  const [activeModel, setActiveModel] = useState('logistic');
  const [classificationData, setClassificationData] = useState(generateClassificationData);

  const handleRegenerate = () => setClassificationData(generateClassificationData());

  const hiredPoints = classificationData.filter(d => d.hired === 1);
  const rejectedPoints = classificationData.filter(d => d.hired === 0);

  const currentModel = classificationModels[activeModel];
  const currentDesc = classificationDescriptions[activeModel];

  const boundaryData = useMemo(() => {
    const points = [];
    for (let exp = 0; exp <= 15; exp += 0.5) {
      const skillThreshold = calculateBoundary(activeModel, exp);
      points.push({ experience: exp, boundary: Math.max(0, Math.min(100, skillThreshold)) });
    }
    return points;
  }, [activeModel]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* MODEL SELECTION BUTTONS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {Object.entries(classificationModels).map(([key, model]) => (
          <button
            key={key}
            onClick={() => setActiveModel(key)}
            className={`w-full py-3 rounded-lg font-semibold transition-all shadow-md ${
              activeModel === key
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105 transform'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {model.name}
          </button>
        ))}
      </div>

      {/* CHART HEADER */}
      <div className="flex flex-wrap justify-between items-center mb-4 px-2 gap-4">
        <div className="flex gap-4 text-sm font-medium">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span><span className="text-green-600">Hired</span></div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span><span className="text-red-600">Rejected</span></div>
          <div className="flex items-center gap-1"><span className="w-6 h-1 rounded bg-current" style={{ color: currentModel.color }}></span><span style={{ color: currentModel.color }}>Decision Boundary</span></div>
        </div>

        <button onClick={handleRegenerate} className="flex items-center gap-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 px-5 py-2.5 rounded-full transform hover:scale-105">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
          Regenerate Data
        </button>
      </div>

      {/* MAIN CHART */}
      <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="experience" 
              label={{ value: 'Years of Experience', position: 'insideBottom', offset: -10 }} 
              stroke="#6b7280" 
              type="number" 
              domain={[0, 15]} 
            />
            <YAxis 
              dataKey="skillScore"
              label={{ value: 'Technical Skill Score', angle: -90, position: 'insideLeft', offset: 0 }} 
              stroke="#6b7280" 
              domain={[0, 100]} 
            />
            <Tooltip content={<ClassificationTooltip />} />

            <Line
              data={boundaryData}
              type="monotone"
              dataKey="boundary"
              stroke={currentModel.color}
              strokeWidth={3}
              strokeDasharray="8 4"
              dot={false}
              name="Decision Boundary"
            />

            <Scatter dataKey="skillScore" data={hiredPoints} fill="#22c55e" name="Hired" shape="circle" />
            <Scatter dataKey="skillScore" data={rejectedPoints} fill="#ef4444" name="Rejected" shape="circle" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* PARAMETER DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {currentModel.parameters.map((param, index) => (
          <ParameterCard key={index} param={param} color={currentModel.color} />
        ))}
      </div>

      {/* MODEL DESCRIPTION */}
      <ModelDescription {...currentDesc} color={currentModel.color} />

      {/* EDUCATIONAL: CLASSIFICATION VS REGRESSION */}
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl shadow-inner p-6 mb-6">
        <h3 className="text-xl font-bold text-slate-700 mb-4 text-center">Classification vs Regression: What's the Difference?</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h4 className="font-bold text-indigo-700 mb-2 text-lg">📊 Regression</h4>
            <p className="text-gray-700 mb-3">Predicts a <strong>continuous number</strong>.</p>
            <ul className="text-sm text-gray-600 space-y-1 mb-3">
              <li>&bull; "What salary will this person earn?" → <span className="font-mono text-indigo-600">£72,500</span></li>
              <li>&bull; "How many units will we sell?" → <span className="font-mono text-indigo-600">1,247</span></li>
              <li>&bull; "What's the house price?" → <span className="font-mono text-indigo-600">£385,000</span></li>
            </ul>
            <div className="bg-indigo-50 p-2 rounded text-xs text-indigo-700">
              Output: Any number on a continuous scale
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h4 className="font-bold text-green-700 mb-2 text-lg">🏷️ Classification</h4>
            <p className="text-gray-700 mb-3">Predicts a <strong>category/label</strong>.</p>
            <ul className="text-sm text-gray-600 space-y-1 mb-3">
              <li>&bull; "Will this person be hired?" → <span className="font-mono text-green-600">Yes / No</span></li>
              <li>&bull; "Is this email spam?" → <span className="font-mono text-green-600">Spam / Not Spam</span></li>
              <li>&bull; "What digit is this?" → <span className="font-mono text-green-600">0, 1, 2, ... 9</span></li>
            </ul>
            <div className="bg-green-50 p-2 rounded text-xs text-green-700">
              Output: One of a fixed set of categories
            </div>
          </div>
        </div>
      </div>

      {/* EDUCATIONAL: CONFUSION MATRIX */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-orange-700 mb-3">The Confusion Matrix: Measuring Classification Performance</h3>
        <p className="text-gray-700 mb-4">Unlike regression (where we measure error in £), classification needs different metrics. The confusion matrix shows all possible outcomes:</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-3 gap-1 text-center text-sm">
              <div></div>
              <div className="font-bold text-green-700 p-2">Actually Hired</div>
              <div className="font-bold text-red-700 p-2">Actually Rejected</div>
              
              <div className="font-bold text-green-700 p-2">Predicted Hired</div>
              <div className="bg-green-100 p-3 rounded font-bold text-green-800">True Positive ✓<br/><span className="text-xs font-normal">Correct hire prediction</span></div>
              <div className="bg-red-100 p-3 rounded font-bold text-red-800">False Positive ✗<br/><span className="text-xs font-normal">Said hire, was reject</span></div>
              
              <div className="font-bold text-red-700 p-2">Predicted Rejected</div>
              <div className="bg-yellow-100 p-3 rounded font-bold text-yellow-800">False Negative ✗<br/><span className="text-xs font-normal">Missed a good hire</span></div>
              <div className="bg-green-100 p-3 rounded font-bold text-green-800">True Negative ✓<br/><span className="text-xs font-normal">Correct reject prediction</span></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="font-bold text-gray-800">Accuracy = (TP + TN) / Total</p>
              <p className="text-sm text-gray-600">% of all predictions that were correct</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="font-bold text-gray-800">Precision = TP / (TP + FP)</p>
              <p className="text-sm text-gray-600">When we predict "Hire", how often are we right?</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="font-bold text-gray-800">Recall = TP / (TP + FN)</p>
              <p className="text-sm text-gray-600">Of all actual hires, how many did we catch?</p>
            </div>
          </div>
        </div>
      </div>

      {/* EDUCATIONAL: DECISION BOUNDARIES */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-purple-700 mb-3">Understanding Decision Boundaries</h3>
        <p className="text-gray-700 mb-4">The dashed line on the chart is the <strong>decision boundary</strong>—the line where the model switches from "Reject" to "Hire".</p>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-bold text-blue-700 mb-2">Linear Boundaries</h4>
            <p className="text-sm text-gray-600">Logistic Regression, Linear SVM, Naive Bayes</p>
            <p className="text-xs text-gray-500 mt-2 italic">Straight lines. Simple but limited.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-bold text-green-700 mb-2">Non-Linear Boundaries</h4>
            <p className="text-sm text-gray-600">Decision Trees, SVM (RBF), Neural Networks</p>
            <p className="text-xs text-gray-500 mt-2 italic">Curves and shapes. More flexible.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-bold text-orange-700 mb-2">Instance-Based</h4>
            <p className="text-sm text-gray-600">k-NN, Random Forest</p>
            <p className="text-xs text-gray-500 mt-2 italic">Irregular, data-driven boundaries.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassificationTab;
