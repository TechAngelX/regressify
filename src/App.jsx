// src/App.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateData, calculateModelFits, descriptions, generateFittingExamples } from './data/salaryModels';

// --- 1. CUSTOM TOOLTIP COMPONENT ---
const CustomTooltip = ({ active, payload, label }) => {
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

// --- 2. MINI CHART COMPONENT (For Educational Section) ---
const MiniChart = ({ data, lineKey, color, title, desc, analogy }) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col h-full">
      <h4 className="text-center font-bold text-slate-700 mb-2">{title}</h4>
      <div className="h-32 w-full mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <Scatter dataKey="actual" fill="#cbd5e1" r={2} />
            <Line type="monotone" dataKey={lineKey} stroke={color} strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        <p className="text-xs text-slate-600 leading-relaxed font-medium">{desc}</p>
        <div className="bg-slate-50 p-2 rounded border border-slate-100">
          <p className="text-[10px] text-slate-500 italic">
            <span className="font-bold not-italic text-slate-600">Analogy: </span>{analogy}
          </p>
        </div>
      </div>
    </div>
);

// --- 3. MAIN APP COMPONENT ---
function App() {
  const [activeModel, setActiveModel] = useState('linear');
  const [showDetails, setShowDetails] = useState(false);

  // Data State
  const [rawData, setRawData] = useState(generateData);
  const [fittingData] = useState(generateFittingExamples); // Static data for education

  // New State: Manual Tuning (Linear Only)
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualSlope, setManualSlope] = useState(5);
  const [manualIntercept, setManualIntercept] = useState(45);

  const handleRegenerate = () => setRawData(generateData());

  // Calculated Fits
  const models = useMemo(() => calculateModelFits(rawData), [rawData]);

  // Logic: Choose between "Best Fit" (Calculated) vs "Manual Fit" (User Sliders)
  const chartData = useMemo(() => {
    if (activeModel === 'linear' && isManualMode) {
      return rawData.map(d => ({
        ...d,
        predicted: manualIntercept + (manualSlope * d.experience)
      }));
    }
    return models[activeModel].data;
  }, [activeModel, isManualMode, rawData, manualSlope, manualIntercept, models]);

  // Helper to split points for Scatter plot
  const normalPoints = chartData.filter(d => !d.isOutlier);
  const outlierPoints = chartData.filter(d => d.isOutlier);

  // When switching models, turn off manual mode to avoid confusion
  useEffect(() => {
    if (activeModel !== 'linear') setIsManualMode(false);
  }, [activeModel]);

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
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800 mt-12">Salary Prediction: Regression Methods Compared</h1>
        <div className="max-w-2xl mx-auto text-center mb-8">
          <p className="text-gray-600 mb-2">Training a machine learning model isn't one-size-fits-all. Depending on your data, you might need the strict logic of a flowchart or the complex intuition of a neural network.</p>
          <p className="text-gray-600 font-medium">I created this cheat sheet to explore how different algorithms "think" about the same data.</p>
        </div>

        <div className="max-w-6xl mx-auto">

          {/* MODEL SELECTION BUTTONS */}
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

          {/* CHART HEADER: LEGEND & CONTROLS */}
          <div className="flex flex-wrap justify-between items-center mb-4 px-2 gap-4">
            <div className="flex gap-4 text-sm font-medium">
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-400"></span><span className="text-slate-600">Normal Employee</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span><span className="text-red-600">Outlier</span></div>
              <div className="flex items-center gap-1"><span className="w-6 h-1 rounded bg-current" style={{ color: models[activeModel].color }}></span><span style={{ color: models[activeModel].color }}>Prediction</span></div>
            </div>

            <div className="flex items-center gap-3">
              {/* Manual Tuning Toggle (Linear Only) */}
              {activeModel === 'linear' && (
                  <div className="flex items-center bg-white rounded-full px-1 py-1 border border-slate-200 shadow-sm">
                    <button onClick={() => setIsManualMode(false)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!isManualMode ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>Auto</button>
                    <button onClick={() => setIsManualMode(true)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isManualMode ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>Manual Tune</button>
                  </div>
              )}

              <button onClick={handleRegenerate} className="flex items-center gap-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 px-5 py-2.5 rounded-full transform hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
                Regenerate Noise
              </button>
            </div>
          </div>

          {/* MAIN CHART COMPONENT */}
          <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="experience" label={{ value: 'Years of Experience', position: 'insideBottom', offset: -10 }} stroke="#6b7280" type="number" domain={[0, 20]} />
                <YAxis label={{ value: 'Salary (£1000s)', angle: -90, position: 'insideLeft', offset: 0 }} stroke="#6b7280" domain={[20, 160]} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 2 }} />
                <Scatter dataKey="actual" data={normalPoints} fill="#94a3b8" name="Normal Employees" shape="circle" />
                <Scatter dataKey="actual" data={outlierPoints} fill="#ef4444" name="Outliers" shape="circle" r={6} />
                <Line
                    data={chartData}
                    type="monotone"
                    dataKey="predicted"
                    stroke={models[activeModel].color}
                    strokeWidth={3}
                    dot={false}
                    name="Prediction Model"
                    animationDuration={isManualMode ? 0 : 1000}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* === INTERACTIVE SECTION 1: MANUAL TUNING SLIDERS (Linear + Manual Only) === */}
          {activeModel === 'linear' && isManualMode && (
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-6 border border-indigo-100 shadow-sm animate-fade-in">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="md:w-1/3">
                    <h3 className="text-lg font-bold text-indigo-900 mb-2">Adjusting Weights & Bias</h3>
                    <p className="text-sm text-indigo-800 mb-3">Machine learning is just finding the best settings for these two sliders automatically.</p>
                    <ul className="text-xs text-indigo-700 space-y-2">
                      <li className="flex gap-2"><span className="font-mono bg-white px-1 rounded border border-indigo-200">w</span><span><b>Weight (Slope):</b> The "Gas Pedal". How fast does salary grow per year?</span></li>
                      <li className="flex gap-2"><span className="font-mono bg-white px-1 rounded border border-indigo-200">b</span><span><b>Bias (Intercept):</b> The "Starting Line". What is the base salary at 0 years?</span></li>
                    </ul>
                  </div>
                  <div className="md:w-2/3 w-full space-y-6">
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-sm font-bold text-gray-700">Weight (w) / Slope</label>
                        <span className="font-mono text-blue-600 font-bold">{manualSlope}</span>
                      </div>
                      <input type="range" min="0" max="10" step="0.1" value={manualSlope} onChange={(e) => setManualSlope(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-sm font-bold text-gray-700">Bias (b) / Y-Intercept</label>
                        <span className="font-mono text-blue-600 font-bold">{manualIntercept}</span>
                      </div>
                      <input type="range" min="20" max="100" step="1" value={manualIntercept} onChange={(e) => setManualIntercept(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
          )}

          {/* === INTERACTIVE SECTION 2: STATIC PARAMETER DASHBOARD (Auto Mode) === */}
          {!isManualMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {models[activeModel].parameters.map((param, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl shadow-md border-l-4 flex flex-col justify-center transition-all hover:shadow-lg" style={{ borderColor: models[activeModel].color }}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-bold border border-gray-200">{param.symbol}</span>
                          <span className="text-gray-700 font-bold uppercase tracking-wider text-xs">{param.name}</span>
                        </div>
                        <span className="font-mono font-bold text-xl" style={{ color: models[activeModel].color }}>{param.value}</span>
                      </div>
                      <p className="text-gray-500 text-sm mt-1 border-t pt-2 border-gray-100 italic">"{param.context}"</p>
                    </div>
                ))}
              </div>
          )}

          {/* MODEL DESCRIPTION BOX */}
          <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold" style={{ color: models[activeModel].color }}>
                  {descriptions[activeModel].title}
                </h2>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded border border-gray-200">
                  {descriptions[activeModel].math}
                </span>
              </div>
              <button onClick={() => setShowDetails(!showDetails)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
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

            {/* Expandable details */}
            {showDetails && (
                <div className="mt-6 space-y-4 border-t pt-6">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-2">How It Works</h3>
                    <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: descriptions[activeModel].howItWorks }}></p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-2">Real-World Example</h3>
                    <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: descriptions[activeModel].realExample }}></p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 h-full flex flex-col">
                      <h3 className="font-bold text-green-800 mb-2">Pros</h3>
                      <ul className="text-sm text-green-900 space-y-1 flex-grow">
                        {descriptions[activeModel].pros.map((pro, idx) => <li key={idx}>&bull; {pro}</li>)}
                      </ul>
                    </div>
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 h-full flex flex-col">
                      <h3 className="font-bold text-red-800 mb-2">Cons</h3>
                      <ul className="text-sm text-red-900 space-y-1 flex-grow">
                        {descriptions[activeModel].cons.map((con, idx) => <li key={idx}>&bull; {con}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
            )}
          </div>

          {/* EDUCATIONAL 1: THE GOLDILOCKS PROBLEM */}
          <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl shadow-inner p-6 mb-6">
            <h3 className="text-xl font-bold text-slate-700 mb-4 text-center">The Goldilocks Problem: Bias vs. Variance</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <MiniChart data={fittingData} lineKey="underfit" color="#ef4444" title="Underfitting (High Bias)" desc="The model is too simple. It ignores the details in your training data." analogy="The Lazy Robot. You train it with 1,000 photos of bananas and lemons. It looks at them and makes a lazy rule: 'Everything Yellow is a Banana.' It failed to learn the shape." />
              <MiniChart data={fittingData} lineKey="optimal" color="#10b981" title="Optimal Fit" desc="Just right. The model learns the general rules (signal) but ignores the random accidents (noise)." analogy="The Smart Robot. You train it with the same photos. It learns that 'Curved = Banana' and 'Round = Lemon.' It ignores the stickers or bruises on the fruit." />
              <MiniChart data={fittingData} lineKey="overfit" color="#3b82f6" title="Overfitting (High Variance)" desc="The model is obsessed. It memorizes the training data perfectly—including the mistakes." analogy="The Obsessive Robot. You train it with bananas that happen to have 'Chiquita' stickers. It learns: 'It is ONLY a banana if it has a sticker.' When you hand it a banana without a sticker, it fails." />
            </div>
            <p className="text-gray-700 my-3 text-center max-w-2xl mx-auto text-sm">
              The goal of Machine Learning is to find the sweet spot: a model complex enough to capture the true underlying pattern (the signal), yet simple enough to ignore random accidents (noise).
            </p>
          </div>

          {/* EDUCATIONAL 2: SCATTER EXPLANATION (Full Width) */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-orange-700 mb-3">Understanding the Scatter: Real-World Variation</h3>
            <p className="text-gray-700 mb-3">In the real world, salary isn't ONLY determined by years of experience. The scatter represents real-world variation from:</p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Individual Factors:</h4>
                <ul className="text-sm text-gray-700 space-y-1"><li>&bull; Negotiation skills</li><li>&bull; Education level (BSc vs MSc vs PhD)</li><li>&bull; Specialisation (ML engineer vs web dev)</li><li>&bull; Performance and productivity</li></ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">External Factors:</h4>
                <ul className="text-sm text-gray-700 space-y-1"><li>&bull; Company size (startup vs FAANG)</li><li>&bull; Geographic location</li><li>&bull; Market timing (hired in boom vs recession)</li><li>&bull; Industry (finance vs non-profit)</li></ul>
              </div>
            </div>
            <div className="bg-blue-100 border-l-4 border-blue-500 p-3 rounded">
              <p className="text-sm text-blue-900"><strong>This is why we need regression:</strong> We can't predict exact salaries, but we can predict the <em>trend</em> and understand the general relationship. The model finds the signal through the noise.</p>
            </div>
          </div>

          {/* EDUCATIONAL 3: RIDGE & LASSO (Grid Row) */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 flex flex-col">
              <h3 className="text-lg font-bold text-purple-700 mb-3">Ridge Regression</h3>
              <p className="text-gray-700 mb-3 text-sm">Imagine predicting salary with 50 factors: experience, education, GitHub commits, interview score, previous salary, etc.</p>
              <div className="bg-white rounded-lg p-3 mb-3"><p className="text-sm text-gray-600">Ridge says: "Keep all 50 factors, but don't let any one dominate too much"</p></div>
              <p className="text-gray-700 text-sm mb-2"><strong>Effect:</strong> Prevents overfitting to quirks in your data. All factors contribute a little, nothing goes crazy.</p>
              <p className="text-purple-600 text-sm font-semibold mt-auto">Real example: Predicting salary with experience, education, skills, location, company size, and 45 other factors</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 flex flex-col">
              <h3 className="text-lg font-bold text-green-700 mb-3">Lasso Regression</h3>
              <p className="text-gray-700 mb-3 text-sm">Same 50 factors, but Lasso is ruthless: it eliminates the weak ones entirely.</p>
              <div className="bg-white rounded-lg p-3 mb-3"><p className="text-sm text-gray-600">Lasso says: "Only 8 factors actually matter. The other 42? Irrelevant. Gone."</p></div>
              <p className="text-gray-700 text-sm mb-2"><strong>Effect:</strong> Automatic feature selection. You discover that only experience, education, location, and specialisation really drive salary.</p>
              <p className="text-green-600 text-sm font-semibold mt-auto">Real example: Discovers that favourite programming language, coffee preference, and desk setup don't predict salary</p>
            </div>
          </div>

          {/* EDUCATIONAL 4: NEURAL NETWORKS (Bottom Full Width Row) */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-indigo-700 mb-4">Neural Network Regression Explained</h3>
            <p className="text-xs text-gray-500 mb-4"></p>

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

        {/* FOOTER */}
        <div className="mt-12 text-center pb-8 border-t border-gray-300 pt-6">
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} <span className="font-semibold">Ricki Angel</span> | <span className="font-semibold text-indigo-600">Tech Angel X</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Interactive Regression Visualisation Tool
          </p>
        </div>
      </div>
  );
}

export default App;
