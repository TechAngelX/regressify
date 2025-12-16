// src/components/RegressionTab.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateData, calculateModelFits, descriptions, generateFittingExamples } from '../data/salaryModels';
import { RegressionTooltip } from './shared/Tooltips';
import MiniChart from './shared/MiniChart';
import ParameterCard from './shared/ParameterCard';
import ModelDescription from './shared/ModelDescription';

const RegressionTab = () => {
  const [activeModel, setActiveModel] = useState('linear');
  const [rawData, setRawData] = useState(generateData);
  const [fittingData] = useState(generateFittingExamples);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualSlope, setManualSlope] = useState(5);
  const [manualIntercept, setManualIntercept] = useState(45);

  const handleRegenerate = () => setRawData(generateData());

  const models = useMemo(() => calculateModelFits(rawData), [rawData]);

  const chartData = useMemo(() => {
    if (activeModel === 'linear' && isManualMode) {
      return rawData.map(d => ({
        ...d,
        predicted: manualIntercept + (manualSlope * d.experience)
      }));
    }
    return models[activeModel].data;
  }, [activeModel, isManualMode, rawData, manualSlope, manualIntercept, models]);

  const normalPoints = chartData.filter(d => !d.isOutlier);
  const outlierPoints = chartData.filter(d => d.isOutlier);

  useEffect(() => {
    if (activeModel !== 'linear') setIsManualMode(false);
  }, [activeModel]);

  return (
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

      {/* MAIN CHART */}
      <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="experience" label={{ value: 'Years of Experience', position: 'insideBottom', offset: -10 }} stroke="#6b7280" type="number" domain={[0, 20]} />
            <YAxis label={{ value: 'Salary (£1000s)', angle: -90, position: 'insideLeft', offset: 0 }} stroke="#6b7280" domain={[20, 160]} />
            <Tooltip content={<RegressionTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 2 }} />

            <Scatter dataKey="actual" data={normalPoints} fill="#94a3b8" name="Normal Employees" shape="circle" isAnimationActive={true} animationDuration={1200} animationEasing="ease-in-out" />
            <Scatter dataKey="actual" data={outlierPoints} fill="#ef4444" name="Outliers" shape="circle" r={6} isAnimationActive={true} animationDuration={1200} animationEasing="ease-in-out" />
            <Line data={chartData} type="monotone" dataKey="predicted" stroke={models[activeModel].color} strokeWidth={3} dot={false} name="Prediction Model" isAnimationActive={true} animationDuration={isManualMode ? 0 : 1200} animationEasing="ease-in-out" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* MANUAL TUNING SECTION */}
      {activeModel === 'linear' && isManualMode && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-6 border border-indigo-100 shadow-sm animate-fade-in">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="md:w-5/12 space-y-4">
              <h3 className="text-lg font-bold text-indigo-900 border-b border-indigo-200 pb-2">The Math Behind the Line</h3>

              <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-sm font-bold">w</span>
                  <span className="text-indigo-900 font-bold text-sm">Weight / Slope</span>
                </div>
                <p className="text-sm text-gray-700 font-medium mb-1">"The Gas Pedal"</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Controls the steepness. In salary terms, this is your <strong>annual raise</strong>. <br/>
                  <span className="italic text-indigo-600 mt-1 block">Higher weight = Faster salary growth.</span>
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-sm font-bold">b</span>
                  <span className="text-indigo-900 font-bold text-sm">Bias / Intercept</span>
                </div>
                <p className="text-sm text-gray-700 font-medium mb-1">"The Starting Line"</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Shifts the line up or down. This represents the <strong>base salary</strong> for a Junior with 0 years experience. <br/>
                  <span className="italic text-indigo-600 mt-1 block">Higher bias = Higher starting salary.</span>
                </p>
              </div>
            </div>

            <div className="md:w-7/12 w-full space-y-6 pt-2">
              <div className="bg-indigo-900 text-white text-center py-3 rounded-lg font-mono text-sm shadow-inner mb-4">
                y = <span className="text-yellow-400 font-bold">{manualSlope}</span>x + <span className="text-green-400 font-bold">{manualIntercept}</span>
                <div className="text-xs text-indigo-300 mt-1">Salary = (Raise × Years) + Base</div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-bold text-gray-700">Weight / Slope (w)</label>
                  <span className="font-mono text-blue-600 font-bold text-lg">{manualSlope}</span>
                </div>
                <input type="range" min="0" max="10" step="0.1" value={manualSlope} onChange={(e) => setManualSlope(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>0 (Flat)</span>
                  <span>10 (Steep)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-bold text-gray-700">Bias / Intercept (b)</label>
                  <span className="font-mono text-blue-600 font-bold text-lg">{manualIntercept}</span>
                </div>
                <input type="range" min="20" max="100" step="1" value={manualIntercept} onChange={(e) => setManualIntercept(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>£20k (Low Base)</span>
                  <span>£100k (High Base)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PARAMETER DASHBOARD */}
      {!isManualMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {models[activeModel].parameters.map((param, index) => (
            <ParameterCard key={index} param={param} color={models[activeModel].color} />
          ))}
        </div>
      )}

      {/* MODEL DESCRIPTION */}
      <ModelDescription {...descriptions[activeModel]} color={models[activeModel].color} />

      {/* EDUCATIONAL 1: GOLDILOCKS */}
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl shadow-inner p-6 mb-6">
        <h3 className="text-xl font-bold text-slate-700 mb-4 text-center">The Goldilocks Problem: Bias vs. Variance</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <MiniChart data={fittingData} lineKey="underfit" color="#ef4444" title="Underfitting (High Bias)" desc="The model is too simple. It ignores the details in your training data." analogy="The Lazy Robot. You train it with 1,000 photos of bananas and lemons. It looks at them and makes a lazy rule: 'Everything Yellow is a Banana.' It failed to learn the shape." />
          <MiniChart data={fittingData} lineKey="optimal" color="#10b981" title="Optimal Fit" desc="Just right. The model learns the general rules (signal) but ignores the random accidents (noise)." analogy="The Smart Robot. You train it with the same photos. It learns that 'Curved = Banana' and 'Round = Lemon.' It ignores the stickers or bruises on the fruit." />
          <MiniChart data={fittingData} lineKey="overfit" color="#3b82f6" title="Overfitting (High Variance)" desc="The model is obsessed. It memorizes the training data perfectly—including the mistakes." analogy="The Obsessive Robot. You train it with bananas that happen to have 'Chiquita' stickers. It learns: 'It is ONLY a banana if it has a sticker.' When you hand it a banana without a sticker, it fails." />
        </div>
        <p className="text-gray-700 my-3 text-center max-w-2xl mx-auto text-sm">
          The goal of Machine Learning is to find the sweet spot: a model complex enough to capture the true
          underlying pattern (the signal), yet simple enough to ignore random accidents (noise). This
          often means accepting a small loss in training accuracy in exchange for better reliability and performance
          on new, unseen data.
        </p>
      </div>

      {/* EDUCATIONAL 2: SCATTER */}
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

      {/* EDUCATIONAL 3: RIDGE & LASSO */}
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

      {/* EDUCATIONAL 4: NEURAL NETWORKS */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6">
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
  );
};

export default RegressionTab;
