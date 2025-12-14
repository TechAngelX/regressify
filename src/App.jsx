// src/App.jsx
import React, { useState, useMemo } from 'react';
import { ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateData, calculateModelFits, descriptions } from './data/salaryModels';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // payload[0] might be the line or the scatter, we need to find the data object
    // usually payload[0].payload gives the full data object for that x-index
    const data = payload[0].payload;
    const isOutlier = data.isOutlier;

    return (
        <div className={`p-4 rounded-lg shadow-xl border-2 z-50 ${isOutlier ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
          <p className="font-bold text-gray-800 mb-1">{label} years experience</p>

          {/* Actual Salary */}
          <p className={`${isOutlier ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
            Actual: £{Math.round(data.actual)}k
          </p>

          {/* Prediction */}
          <p className="text-indigo-600 font-semibold">
            Predicted: £{Math.round(data.predicted)}k
          </p>

          {/* The Story (Only for outliers) */}
          {isOutlier && (
              <div className="mt-2 pt-2 border-t border-red-200">
                <p className="text-xs font-bold text-red-800 uppercase tracking-wide">Outlier Detected</p>
                <p className="text-sm text-red-700 italic mt-1 max-w-[200px]">
                  "{data.label}"
                </p>
              </div>
          )}
        </div>
    );
  }
  return null;
};

function App() {
  const [activeModel, setActiveModel] = useState('linear');
  const [showDetails, setShowDetails] = useState(false);

  // Initialize data with state, so we can regenerate it
  const [rawData, setRawData] = useState(generateData);

  const handleRegenerate = () => {
    setRawData(generateData());
  };

  // Calculate models based on the raw data
  const models = useMemo(() => calculateModelFits(rawData), [rawData]);

  // Separate data for rendering layers
  const currentData = models[activeModel].data;
  const normalPoints = currentData.filter(d => !d.isOutlier);
  const outlierPoints = currentData.filter(d => d.isOutlier);

  return (
      <div className="w-full min-h-screen p-8 bg-gradient-to-br from-slate-50 to-indigo-50">
        {/* Logo and Branding */}
        <div className="absolute top-4 left-4 flex items-center gap-3">
          <img
              src="/images/logo.png"
              alt="Tech Angel X Logo"
              className="w-16 h-16 rounded-full shadow-lg border-2 border-white"
          />
          <div className="text-sm">
            <p className="font-bold text-gray-800">Tech Angel X</p>
            <p className="text-gray-600 text-xs">by Ricki Angel</p>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800 mt-12">Salary Prediction: Regression Methods Compared</h1>

        {/* Intro / Cheat Sheet Text */}
        <div className="max-w-2xl mx-auto text-center mb-8">
          <p className="text-gray-600 mb-2">
            Training a machine learning model isn't one-size-fits-all. Depending on your data, you might need the strict logic of a flowchart or the complex intuition of a neural network.
          </p>
          <p className="text-gray-600 font-medium">
            I created this cheat sheet to explore how different algorithms "think" about the same data.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Model selector buttons - GRID LAYOUT 4x2 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(models).map(([key, model]) => (
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

          {/* Chart Header: Legend & Refresh */}
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex gap-4 text-sm font-medium">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                <span className="text-slate-600">Normal Employee</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-red-600">Outlier (Hover me!)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-6 h-1 rounded bg-current" style={{ color: models[activeModel].color }}></span>
                <span style={{ color: models[activeModel].color }}>Prediction</span>
              </div>
            </div>

            {/* Prominent Regenerate Button */}
            <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 px-5 py-2.5 rounded-full transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
              </svg>
              Regenerate Noise
            </button>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
            <ResponsiveContainer width="100%" height={400}>
              {/* Added margins to prevent axis labels from being cut off */}
              <ComposedChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                    dataKey="experience"
                    label={{ value: 'Years of Experience', position: 'insideBottom', offset: -10 }}
                    stroke="#6b7280"
                    type="number"
                    domain={[0, 20]}
                />
                <YAxis
                    label={{ value: 'Salary (£1000s)', angle: -90, position: 'insideLeft', offset: 0 }}
                    stroke="#6b7280"
                    domain={[20, 160]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 2 }} />

                {/* 1. Normal Points (Grey) */}
                <Scatter
                    dataKey="actual"
                    data={normalPoints}
                    fill="#94a3b8"
                    name="Normal Employees"
                    shape="circle"
                />

                {/* 2. Outliers (Red & Pulsing) */}
                <Scatter
                    dataKey="actual"
                    data={outlierPoints}
                    fill="#ef4444"
                    name="Outliers"
                    shape="circle"
                    r={6}
                />

                <Line
                    data={currentData}
                    type="monotone"
                    dataKey="predicted"
                    stroke={models[activeModel].color}
                    strokeWidth={3}
                    dot={false}
                    name="Prediction Model"
                    animationDuration={1000}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold" style={{ color: models[activeModel].color }}>
                  {descriptions[activeModel].title}
                </h2>
                {/* Math Badge */}
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded border border-gray-200">
                  {descriptions[activeModel].math}
                </span>
              </div>

              <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                {showDetails ? '- Hide Details' : '+ Show Details'}
              </button>
            </div>

            <p className="text-gray-700 text-lg mb-3">
              {descriptions[activeModel].desc}
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
              <p className="text-sm font-semibold text-blue-900">Best used:</p>
              <p className="text-blue-800">{descriptions[activeModel].when}</p>
            </div>

            {/* Expandable detailed section */}
            {showDetails && (
                <div className="mt-6 space-y-4 border-t pt-6">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                      How It Works
                    </h3>
                    <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: descriptions[activeModel].howItWorks }}></p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                      Real-World Example
                    </h3>
                    <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: descriptions[activeModel].realExample }}></p>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                      Visual Pattern
                    </h3>
                    <p className="text-gray-700">{descriptions[activeModel].visualPattern}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Added h-full and flex properties to ensure equal height boxes */}
                    <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 h-full flex flex-col">
                      <h3 className="font-bold text-green-800 mb-2">Pros</h3>
                      <ul className="text-sm text-green-900 space-y-1 flex-grow">
                        {descriptions[activeModel].pros.map((pro, idx) => (
                            <li key={idx}>&bull; {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 h-full flex flex-col">
                      <h3 className="font-bold text-red-800 mb-2">Cons</h3>
                      <ul className="text-sm text-red-900 space-y-1 flex-grow">
                        {descriptions[activeModel].cons.map((con, idx) => (
                            <li key={idx}>&bull; {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
            )}
          </div>

          {/* Why the scatter/noise exists */}
          <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-orange-700 mb-3">Understanding the Scatter: Real-World Variation</h3>
            <p className="text-gray-700 mb-3">
              In the real world, salary isn't ONLY determined by years of experience. The scatter represents real-world variation from:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Added h-full to ensure equal height boxes */}
              <div className="bg-white rounded-lg p-4 h-full">
                <h4 className="font-semibold text-gray-800 mb-2">Individual Factors:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>&bull; Negotiation skills</li>
                  <li>&bull; Education level (BSc vs MSc vs PhD)</li>
                  <li>&bull; Specialisation (ML engineer vs web dev)</li>
                  <li>&bull; Performance and productivity</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 h-full">
                <h4 className="font-semibold text-gray-800 mb-2">External Factors:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>&bull; Company size (startup vs FAANG)</li>
                  <li>&bull; Geographic location</li>
                  <li>&bull; Market timing (hired in boom vs recession)</li>
                  <li>&bull; Industry (finance vs non-profit)</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 bg-blue-100 border-l-4 border-blue-500 p-3 rounded">
              <p className="text-sm text-blue-900">
                <strong>This is why we need regression:</strong> We can't predict exact salaries, but we can predict the <em>trend</em> and understand the general relationship. The model finds the signal through the noise.
              </p>
            </div>
          </div>

          {/* Ridge & Lasso explanation */}
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {/* Added h-full and flex properties for alignment */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 h-full flex flex-col">
              <h3 className="text-xl font-bold text-purple-700 mb-3">Ridge Regression</h3>
              <p className="text-gray-700 mb-3">
                Imagine predicting salary with 50 factors: experience, education, GitHub commits, interview score, previous salary, etc.
              </p>
              <div className="bg-white rounded-lg p-4 mb-3 flex-grow">
                <p className="text-sm text-gray-600">Ridge says: "Keep all 50 factors, but don't let any one dominate too much"</p>
              </div>
              <p className="text-gray-700 text-sm">
                <strong>Effect:</strong> Prevents overfitting to quirks in your data. All factors contribute a little, nothing goes crazy.
              </p>
              <p className="text-purple-600 text-sm mt-2 font-semibold">
                Real example: Predicting salary with experience, education, skills, location, company size, and 45 other factors
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 h-full flex flex-col">
              <h3 className="text-xl font-bold text-green-700 mb-3">Lasso Regression</h3>
              <p className="text-gray-700 mb-3">
                Same 50 factors, but Lasso is ruthless: it eliminates the weak ones entirely.
              </p>
              <div className="bg-white rounded-lg p-4 mb-3 flex-grow">
                <p className="text-sm text-gray-600">Lasso says: "Only 8 factors actually matter. The other 42? Irrelevant. Gone."</p>
              </div>
              <p className="text-gray-700 text-sm">
                <strong>Effect:</strong> Automatic feature selection. You discover that only experience, education, location, and specialisation really drive salary.
              </p>
              <p className="text-green-600 text-sm mt-2 font-semibold">
                Real example: Discovers that favourite programming language, coffee preference, and desk setup don't predict salary
              </p>
            </div>
          </div>

          {/* Neural network deep dive */}
          <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-indigo-700 mb-4">Neural Network Regression Explained</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-full">
                <h4 className="font-bold text-gray-800 mb-2">Real-world example:</h4>
                <p className="text-gray-700 mb-4">
                  Predicting house prices from photos. The neural network learns: Layer 1 detects edges, Layer 2 recognises windows/doors, Layer 3 identifies architectural style, Final layer predicts price.
                </p>

                <h4 className="font-bold text-gray-800 mb-2">For salary prediction:</h4>
                <p className="text-gray-700">
                  Can learn that "5 years experience + ML specialisation + Bay Area" creates a non-linear jump in salary. Captures interactions that simple regression misses.
                </p>
              </div>

              <div className="h-full flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Why it's powerful:</h4>
                  <ul className="text-gray-700 space-y-2 mb-4">
                    <li>&bull; Learns feature combinations automatically</li>
                    <li>&bull; Finds hidden patterns humans don't notice</li>
                    <li>&bull; Works with messy, high-dimensional data</li>
                    <li>&bull; Can improve with more data</li>
                  </ul>
                </div>

                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded mt-auto">
                  <p className="text-sm text-yellow-900">
                    <strong>Trade-off:</strong> Needs 10,000+ examples to work well. Ridge/Lasso work fine with 100 examples.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Copyright */}
        <div className="mt-12 text-center pb-8">
          <div className="border-t border-gray-300 pt-6">
            <p className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} <span className="font-semibold">Ricki Angel</span> | <span className="font-semibold text-indigo-600">Tech Angel X</span>
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Interactive Regression Visualisation Tool
            </p>
          </div>
        </div>
      </div>
  );
}

export default App;
