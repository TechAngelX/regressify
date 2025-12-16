// src/components/ClassificationTab.jsx
import React, { useState, useMemo } from 'react';
import { ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { classificationModels, classificationDescriptions, calculateBoundary } from '../data/classificationModels';
import ParameterCard from './shared/ParameterCard';
import ModelDescription from './shared/ModelDescription';

// Preset scenarios for classification
const classificationScenarios = {
  hiring: {
    name: 'Job Hiring',
    icon: '💼',
    xLabel: 'Years of Experience',
    yLabel: 'Technical Skill Score',
    class1: { name: 'Hired', color: '#22c55e', emoji: '✓' },
    class2: { name: 'Rejected', color: '#ef4444', emoji: '✗' }
  },
  spam: {
    name: 'Spam Detection',
    icon: '📧',
    xLabel: 'Suspicious Keywords',
    yLabel: 'Link Count',
    class1: { name: 'Spam', color: '#ef4444', emoji: '🚫' },
    class2: { name: 'Not Spam', color: '#22c55e', emoji: '✓' }
  },
  medical: {
    name: 'Medical Diagnosis',
    icon: '🏥',
    xLabel: 'Biomarker A',
    yLabel: 'Biomarker B',
    class1: { name: 'Benign', color: '#22c55e', emoji: '✓' },
    class2: { name: 'Malignant', color: '#ef4444', emoji: '⚠️' }
  },
  animals: {
    name: 'Cat vs Dog',
    icon: '🐾',
    xLabel: 'Ear Pointiness',
    yLabel: 'Snout Length',
    class1: { name: 'Cat', color: '#f59e0b', emoji: '🐱' },
    class2: { name: 'Dog', color: '#3b82f6', emoji: '🐶' }
  },
  loan: {
    name: 'Loan Approval',
    icon: '🏦',
    xLabel: 'Annual Income (£10k)',
    yLabel: 'Credit Score',
    class1: { name: 'Approved', color: '#22c55e', emoji: '✓' },
    class2: { name: 'Denied', color: '#ef4444', emoji: '✗' }
  },
  custom: {
    name: 'Custom',
    icon: '✏️',
    xLabel: 'Feature 1',
    yLabel: 'Feature 2',
    class1: { name: 'Class A', color: '#22c55e', emoji: '●' },
    class2: { name: 'Class B', color: '#ef4444', emoji: '●' }
  }
};

// Generate data based on scenario
const generateScenarioData = (scenario) => {
  const data = [];
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 15;
    const y = Math.random() * 100;
    
    const score = x * 5 + y * 0.8;
    const noise = (Math.random() - 0.5) * 30;
    const isClass1 = (score + noise) > 70 ? 1 : 0;
    
    data.push({
      x: parseFloat(x.toFixed(1)),
      y: parseFloat(y.toFixed(0)),
      class: isClass1,
      label: isClass1 ? `${scenario.class1.name} ${scenario.class1.emoji}` : `${scenario.class2.name} ${scenario.class2.emoji}`
    });
  }
  return data;
};

const ClassificationTab = () => {
  const [activeModel, setActiveModel] = useState('logistic');
  const [activeScenario, setActiveScenario] = useState('hiring');
  const [customX, setCustomX] = useState('Feature 1');
  const [customY, setCustomY] = useState('Feature 2');
  const [customClass1, setCustomClass1] = useState('Class A');
  const [customClass2, setCustomClass2] = useState('Class B');

  // Get current scenario config
  const scenario = useMemo(() => {
    const s = classificationScenarios[activeScenario];
    if (activeScenario === 'custom') {
      return { 
        ...s, 
        xLabel: customX, 
        yLabel: customY,
        class1: { ...s.class1, name: customClass1 },
        class2: { ...s.class2, name: customClass2 }
      };
    }
    return s;
  }, [activeScenario, customX, customY, customClass1, customClass2]);

  const [classificationData, setClassificationData] = useState(() => generateScenarioData(classificationScenarios.hiring));

  // Regenerate data when scenario changes
  const handleRegenerate = () => setClassificationData(generateScenarioData(scenario));

  const class1Points = classificationData.filter(d => d.class === 1);
  const class2Points = classificationData.filter(d => d.class === 0);

  const currentModel = classificationModels[activeModel];
  const currentDesc = classificationDescriptions[activeModel];

  const boundaryData = useMemo(() => {
    const points = [];
    for (let x = 0; x <= 15; x += 0.5) {
      const yThreshold = calculateBoundary(activeModel, x);
      points.push({ x, boundary: Math.max(0, Math.min(100, yThreshold)) });
    }
    return points;
  }, [activeModel]);

  // Dynamic tooltip
  const DynamicTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isClass1 = data.class === 1;
      return (
        <div className={`p-4 rounded-lg shadow-xl border-2 z-50`} style={{ 
          backgroundColor: isClass1 ? `${scenario.class1.color}15` : `${scenario.class2.color}15`,
          borderColor: isClass1 ? scenario.class1.color : scenario.class2.color
        }}>
          <p className="font-bold text-gray-800 mb-1">{scenario.xLabel}: {data.x}</p>
          <p className="text-gray-600">{scenario.yLabel}: {data.y}</p>
          <p className="font-bold mt-1" style={{ color: isClass1 ? scenario.class1.color : scenario.class2.color }}>
            {data.label}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* SCENARIO PICKER */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-sm font-bold text-gray-700">What are you classifying?</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(classificationScenarios).map(([key, s]) => (
              <button
                key={key}
                onClick={() => {
                  setActiveScenario(key);
                  setClassificationData(generateScenarioData(s));
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeScenario === key
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{s.icon}</span> {s.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Custom inputs */}
        {activeScenario === 'custom' && (
          <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">X-Axis:</label>
              <input
                type="text"
                value={customX}
                onChange={(e) => setCustomX(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm w-32"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Y-Axis:</label>
              <input
                type="text"
                value={customY}
                onChange={(e) => setCustomY(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm w-32"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Class 1:</label>
              <input
                type="text"
                value={customClass1}
                onChange={(e) => setCustomClass1(e.target.value)}
                className="px-3 py-1.5 border border-green-300 rounded-lg text-sm w-24 bg-green-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Class 2:</label>
              <input
                type="text"
                value={customClass2}
                onChange={(e) => setCustomClass2(e.target.value)}
                className="px-3 py-1.5 border border-red-300 rounded-lg text-sm w-24 bg-red-50"
              />
            </div>
          </div>
        )}
      </div>
      {/* MODEL SELECTION BUTTONS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {Object.entries(classificationModels).map(([key, model]) => (
          <button
            key={key}
            onClick={() => setActiveModel(key)}
            className={`w-full py-4 rounded-lg font-semibold transition-all shadow-md flex flex-col items-center gap-2 ${
              activeModel === key
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105 transform'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl">{model.icon}</span>
            <span className="text-xs">{model.name}</span>
          </button>
        ))}
      </div>

      {/* CHART HEADER */}
      <div className="flex flex-wrap justify-between items-center mb-4 px-2 gap-4">
        <div className="flex gap-4 text-sm font-medium">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: scenario.class1.color }}></span>
            <span style={{ color: scenario.class1.color }}>{scenario.class1.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: scenario.class2.color }}></span>
            <span style={{ color: scenario.class2.color }}>{scenario.class2.name}</span>
          </div>
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
              dataKey="x" 
              label={{ value: scenario.xLabel, position: 'insideBottom', offset: -10 }} 
              stroke="#6b7280" 
              type="number" 
              domain={[0, 15]} 
            />
            <YAxis 
              dataKey="y"
              label={{ value: scenario.yLabel, angle: -90, position: 'insideLeft', offset: 0 }} 
              stroke="#6b7280" 
              domain={[0, 100]} 
            />
            <Tooltip content={<DynamicTooltip />} />

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

            <Scatter dataKey="y" data={class1Points} fill={scenario.class1.color} name={scenario.class1.name} shape="circle" />
            <Scatter dataKey="y" data={class2Points} fill={scenario.class2.color} name={scenario.class2.name} shape="circle" />
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
              <li>&bull; Your scenario: → <span className="font-mono" style={{color: scenario.class1.color}}>{scenario.class1.name}</span> / <span className="font-mono" style={{color: scenario.class2.color}}>{scenario.class2.name}</span></li>
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
        <p className="text-gray-700 mb-4">Unlike regression (where we measure error), classification needs different metrics. The confusion matrix shows all possible outcomes:</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-3 gap-1 text-center text-sm">
              <div></div>
              <div className="font-bold p-2" style={{color: scenario.class1.color}}>Actually {scenario.class1.name}</div>
              <div className="font-bold p-2" style={{color: scenario.class2.color}}>Actually {scenario.class2.name}</div>
              
              <div className="font-bold p-2" style={{color: scenario.class1.color}}>Predicted {scenario.class1.name}</div>
              <div className="bg-green-100 p-3 rounded font-bold text-green-800">True Positive ✓<br/><span className="text-xs font-normal">Correct!</span></div>
              <div className="bg-red-100 p-3 rounded font-bold text-red-800">False Positive ✗<br/><span className="text-xs font-normal">Wrong prediction</span></div>
              
              <div className="font-bold p-2" style={{color: scenario.class2.color}}>Predicted {scenario.class2.name}</div>
              <div className="bg-yellow-100 p-3 rounded font-bold text-yellow-800">False Negative ✗<br/><span className="text-xs font-normal">Missed it</span></div>
              <div className="bg-green-100 p-3 rounded font-bold text-green-800">True Negative ✓<br/><span className="text-xs font-normal">Correct!</span></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="font-bold text-gray-800">Accuracy = (TP + TN) / Total</p>
              <p className="text-sm text-gray-600">% of all predictions that were correct</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="font-bold text-gray-800">Precision = TP / (TP + FP)</p>
              <p className="text-sm text-gray-600">When we predict "{scenario.class1.name}", how often are we right?</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="font-bold text-gray-800">Recall = TP / (TP + FN)</p>
              <p className="text-sm text-gray-600">Of all actual {scenario.class1.name}s, how many did we catch?</p>
            </div>
          </div>
        </div>
      </div>

      {/* EDUCATIONAL: DECISION BOUNDARIES */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-purple-700 mb-3">Understanding Decision Boundaries</h3>
        <p className="text-gray-700 mb-4">The dashed line on the chart is the <strong>decision boundary</strong>—the line where the model switches from "<span style={{color: scenario.class2.color}}>{scenario.class2.name}</span>" to "<span style={{color: scenario.class1.color}}>{scenario.class1.name}</span>".</p>
        
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
