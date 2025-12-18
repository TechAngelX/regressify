import React, { useState, useMemo, useEffect } from 'react';
import { ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateData, calculateModelFits, descriptions, generateFittingExamples } from '../data/regressionModels';
import { useTheme } from '../context/ThemeContext';
import MiniChart from './shared/MiniChart';
import ParameterCard from './shared/ParameterCard';
import ModelDescription from './shared/ModelDescription';
import CurvatureTuner from './CurvatureTuner';

const contextData = {
  salary: {
    wTitle: "The Annual Raise",
    wDesc: "How much extra you get paid for every 1 year of experience.",
    bTitle: "The Graduate Salary",
    bDesc: "The base starting salary for someone with 0 years experience."
  },
  housePrices: {
    wTitle: "Price per Sq Metre",
    wDesc: "How much value is added for every extra square metre of space.",
    bTitle: "Land Value",
    bDesc: "The base price of the property regardless of house size (location value)."
  },
  carMileage: {
    wTitle: "Depreciation Rate",
    wDesc: "How much value the car loses for every 10k miles driven (usually negative!).",
    bTitle: "New Car Price",
    bDesc: "The price of the car when it was brand new (0 miles)."
  },
  plantGrowth: {
    wTitle: "Growth Rate",
    wDesc: "How many cm the plant grows per week.",
    bTitle: "Seedling Height",
    bDesc: "The initial height of the plant when first measured."
  },
  memeAdoption: {
    wTitle: "Viral Factor",
    wDesc: "How rapidly shares increase per hour.",
    bTitle: "Seed Shares",
    bDesc: "The initial number of shares by the creator."
  },
  custom: {
    wTitle: "Slope / Rate",
    wDesc: "How much Y changes when X increases by 1.",
    bTitle: "Intercept / Start",
    bDesc: "The value of Y when X is 0."
  }
};

const polyShapeData = Array.from({ length: 21 }, (_, i) => {
  const x = i;
  return {
    x,
    smile: 0.8 * Math.pow(x - 10, 2) + 20,
    frown: -0.8 * Math.pow(x - 10, 2) + 120,
    plateau: 100 * (1 - Math.exp(-0.4 * x)) + 10,
    jCurve: 0.5 * Math.pow(x, 2.2) + 5
  };
});

const presetScenarios = {
  salary: { name: 'Salary Prediction', icon: '💰', label: 'Salary vs Experience', xLabel: 'Years of Experience', yLabel: 'Salary (£1000s)', xUnit: 'years', yUnit: ' k' },
  housePrices: { name: 'House Prices', icon: '🏠', label: 'House Price vs Size', xLabel: 'Square Metres', yLabel: 'Price (£1000s)', xUnit: 'm²', yUnit: ' k' },
  carMileage: { name: 'Car Value', icon: '🚗', label: 'Car Value vs Mileage', xLabel: 'Mileage (10k miles)', yLabel: 'Resale Value (£1000s)', xUnit: '10k mi', yUnit: ' k' },
  plantGrowth: { name: 'Plant Growth', icon: '🌱', label: 'Plant Height Over Time', xLabel: 'Weeks Since Planting', yLabel: 'Height (cm)', xUnit: 'weeks', yUnit: ' cm' },
  memeAdoption: { name: 'Meme Adoption', icon: '🐸', label: 'Virality over Time', xLabel: 'Hours Since Upload', yLabel: 'Shares (1000s)', xUnit: 'h', yUnit: 'k' },
  custom: { name: 'Custom', icon: '✏️', label: 'Custom Regression', xLabel: 'X Value', yLabel: 'Y Value', xUnit: '', yUnit: '' }
};

const RegressionTab = () => {
  const { isDark, bgCard, text, textMuted, border, chartGrid, chartAxis } = useTheme();

  const [activeModel, setActiveModel] = useState('linear');
  const [activeScenario, setActiveScenario] = useState('salary');
  const [customX, setCustomX] = useState('X Value');
  const [customY, setCustomY] = useState('Y Value');
  const [rawData, setRawData] = useState(generateData);
  const [fittingData] = useState(generateFittingExamples);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualSlope, setManualSlope] = useState(5);
  const [manualIntercept, setManualIntercept] = useState(40);
  const [squaredTerm, setSquaredTerm] = useState(-0.5);

  const scenario = useMemo(() => {
    const s = presetScenarios[activeScenario];
    if (activeScenario === 'custom') return { ...s, xLabel: customX, yLabel: customY };
    if (['plantGrowth', 'memeAdoption'].includes(activeScenario)) return { ...s, currency: '' };
    return { ...s, currency: '£' };
  }, [activeScenario, customX, customY]);

  const currentContext = contextData[activeScenario] || contextData.custom;

  const handleRegenerate = () => setRawData(generateData());
  const models = useMemo(() => calculateModelFits(rawData, activeScenario), [rawData, activeScenario]);

  const chartData = useMemo(() => {
    if (activeModel === 'linear' && isManualMode) {
      return rawData.map(d => ({ ...d, predicted: manualIntercept + (manualSlope * d.experience) }));
    }
    if (activeModel === 'polynomial' && isManualMode) {
      return rawData.map(d => {
        const linearPart = manualIntercept + (manualSlope * d.experience);
        const xCentered = d.experience - 10;
        const curvePart = squaredTerm * 1.5 * (xCentered * xCentered);
        return { ...d, predicted: linearPart - curvePart };
      });
    }
    return models[activeModel].data;
  }, [activeModel, isManualMode, rawData, manualSlope, manualIntercept, models, squaredTerm]);

  const normalPoints = chartData.filter(d => !d.isOutlier);
  const outlierPoints = chartData.filter(d => d.isOutlier);

  useEffect(() => {
    if (['tree', 'forest', 'svm'].includes(activeModel)) setIsManualMode(false);
  }, [activeModel]);

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
                  <p className="text-sm text-red-200 italic mt-1 max-w-[200px]">"{data.label[activeScenario]}"</p>
                </div>
            )}
          </div>
      );
    }
    return null;
  };

  return (
      <div className="max-w-6xl mx-auto">
        {/* SCENARIO PICKER */}
        <div className={`rounded-xl shadow-lg p-4 mb-6 ${bgCard}`}>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`text-sm font-bold ${text}`}>What are you predicting?</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(presetScenarios).map(([key, s]) => (
                  <button
                      key={key}
                      onClick={() => setActiveScenario(key)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          activeScenario === key
                              ? 'bg-indigo-600 text-white shadow-md'
                              : isDark ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    <span className="mr-1">{s.icon}</span> {s.name}
                  </button>
              ))}
            </div>
          </div>

          {activeScenario === 'custom' && (
              <div className={`flex flex-wrap gap-4 pt-3 border-t ${border}`}>
                <div className="flex items-center gap-2">
                  <label className={`text-sm ${textMuted}`}>X-Axis:</label>
                  <input type="text" value={customX} onChange={(e) => setCustomX(e.target.value)} className={`px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-700 border-slate-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800'}`} />
                </div>
                <div className="flex items-center gap-2">
                  <label className={`text-sm ${textMuted}`}>Y-Axis:</label>
                  <input type="text" value={customY} onChange={(e) => setCustomY(e.target.value)} className={`px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-slate-700 border-slate-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800'}`} />
                </div>
              </div>
          )}
        </div>

        {/* MODEL SELECTION */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(models).map(([key, model]) => (
              <button
                  key={key}
                  onClick={() => setActiveModel(key)}
                  className={`w-full py-4 rounded-lg font-semibold transition-all shadow-md flex flex-col items-center gap-2 ${
                      activeModel === key
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105 transform'
                          : isDark ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <span className="text-2xl">{model.icon}</span>
                <span className="text-xs">{model.name}</span>
              </button>
          ))}
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap justify-between items-center mb-4 px-2 gap-4">
          <div className="flex gap-4 text-sm font-medium">
            <div className="flex items-center gap-1"><span className={`w-3 h-3 rounded-full ${isDark ? 'bg-slate-500' : 'bg-slate-400'}`}></span><span className={textMuted}>Normal</span></div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span><span className="text-red-500">Outlier</span></div>
            <div className="flex items-center gap-1"><span className="w-6 h-1 rounded" style={{ backgroundColor: models[activeModel].color }}></span><span style={{ color: models[activeModel].color }}>Prediction</span></div>
          </div>

          <div className="flex items-center gap-3">
            {['linear', 'polynomial'].includes(activeModel) && (
                <div className={`flex items-center rounded-full px-1 py-1 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <button onClick={() => setIsManualMode(false)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!isManualMode ? 'bg-blue-100 text-blue-700' : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>Auto</button>
                  <button onClick={() => setIsManualMode(true)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isManualMode ? 'bg-indigo-600 text-white shadow' : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>Manual Tune</button>
                </div>
            )}
            {activeModel === 'polynomial' && <CurvatureTuner w2={squaredTerm} setW2={setSquaredTerm} />}
            <div className="flex items-center gap-2">
              <button onClick={handleRegenerate} className={`p-2 rounded-full transition-all shadow-md ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400' : 'bg-white hover:bg-indigo-50 text-indigo-600'}`} title="Shuffle Outliers"><span className="text-xl">🎲</span></button>
              <button onClick={handleRegenerate} className="flex items-center gap-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg px-5 py-2.5 rounded-full transform hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
                Regenerate
              </button>
            </div>
          </div>
        </div>

        {/* CHART */}
        <div className={`rounded-xl shadow-xl p-6 mb-6 ${bgCard}`}>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
              <XAxis dataKey="experience" label={{ value: scenario.xLabel, position: 'insideBottom', offset: -10, fill: chartAxis }} stroke={chartAxis} type="number" domain={[0, 20]} />
              <YAxis label={{ value: scenario.yLabel, angle: -90, position: 'insideLeft', offset: 0, fill: chartAxis }} stroke={chartAxis} domain={[20, 160]} />
              <Tooltip content={<DynamicTooltip />} cursor={{ stroke: chartGrid, strokeWidth: 2 }} />
              <Scatter dataKey="actual" data={normalPoints} fill={isDark ? '#64748b' : '#94a3b8'} name="Normal" shape="circle" />
              <Scatter dataKey="actual" data={outlierPoints} fill="#ef4444" name="Outliers" shape="circle" r={6} />
              <Line data={chartData} type="monotone" dataKey="predicted" stroke={models[activeModel].color} strokeWidth={3} dot={false} animationDuration={isManualMode ? 0 : 1200} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* MANUAL TUNING */}
        {['linear', 'polynomial'].includes(activeModel) && isManualMode && (
            <div className={`rounded-xl p-6 mb-6 border ${isDark ? 'bg-slate-800 border-indigo-500/30' : 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100'}`}>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="md:w-5/12 space-y-4">
                  <h3 className={`text-lg font-bold border-b pb-2 ${isDark ? 'text-indigo-400 border-slate-700' : 'text-indigo-900 border-indigo-200'}`}>
                    {activeModel === 'polynomial' ? 'The Maths Behind the Curve' : 'The Maths Behind the Line'}
                  </h3>
                  <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-indigo-100'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-mono px-2 py-0.5 rounded text-sm font-bold ${isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>w</span>
                      <span className={`font-bold text-sm ${isDark ? 'text-indigo-300' : 'text-indigo-900'}`}>{currentContext.wTitle}</span>
                    </div>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{currentContext.wDesc}</p>
                  </div>
                  <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-indigo-100'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-mono px-2 py-0.5 rounded text-sm font-bold ${isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>b</span>
                      <span className={`font-bold text-sm ${isDark ? 'text-indigo-300' : 'text-indigo-900'}`}>{currentContext.bTitle}</span>
                    </div>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{currentContext.bDesc}</p>
                  </div>
                </div>

                <div className="md:w-7/12 w-full space-y-6 pt-2">
                  <div className="bg-indigo-900 text-white text-center py-3 rounded-lg font-mono text-sm shadow-inner mb-4">
                    {activeModel === 'linear' ? (
                        <span>y = <span className="text-yellow-400 font-bold">{manualSlope}</span>x + <span className="text-green-400 font-bold">{manualIntercept}</span></span>
                    ) : (
                        <span>y = <span className="text-pink-400 font-bold">{squaredTerm}</span>x² + <span className="text-yellow-400 font-bold">{manualSlope}</span>x + <span className="text-green-400 font-bold">{manualIntercept}</span></span>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Weight / Slope (w)</label>
                      <span className="font-mono text-blue-500 font-bold text-lg">{manualSlope}</span>
                    </div>
                    <input type="range" min="0" max="10" step="0.1" value={manualSlope} onChange={(e) => setManualSlope(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Bias / Intercept (b)</label>
                      <span className="font-mono text-blue-500 font-bold text-lg">{manualIntercept}</span>
                    </div>
                    <input type="range" min="20" max="100" step="1" value={manualIntercept} onChange={(e) => setManualIntercept(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* PARAMETER DASHBOARD */}
        {!isManualMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {models[activeModel].parameters
                  .filter(param => param.label !== 'Squared Term')
                  .map((param, index) => (
                      <ParameterCard key={index} param={param} color={models[activeModel].color} />
                  ))}
            </div>
        )}

        <div className="mt-8">
          <ModelDescription {...descriptions[activeModel]} color={models[activeModel].color} />
        </div>

        {/* POLYNOMIAL SHAPES */}
        {activeModel === 'polynomial' && (
            <div className={`rounded-xl shadow-inner p-8 mb-16 h-auto ${isDark ? 'bg-slate-800/50' : 'bg-gradient-to-br from-slate-100 to-slate-200'}`}>
              <h3 className={`text-xl font-bold mb-6 text-center ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>
                Understanding Polynomial Shapes: The Power of x²
              </h3>

              <div className="grid md:grid-cols-4 gap-6 items-stretch">

                {/* Frown (Sad Smile) Card */}
                <div className={`p-4 rounded-xl border flex flex-col h-full ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <MiniChart data={polyShapeData} lineKey="frown" color="#ef4444" title="The 'Sad Smile' (Inverted U)" />
                  {/* NEW LABEL ADDED HERE */}
                  <div className="text-center font-mono text-xs text-slate-500 mb-3 mt-2">
                    Parabola: y = ax² + bx + c, a &lt; 0
                  </div>
                  <div className="mt-2 text-xs flex-grow space-y-4">
                    <div>
                      <p className={`font-bold mb-1 ${isDark ? 'text-red-300' : 'text-red-700'}`}>Example 1: Healthy strength in human beings.</p>
                      <ul className={`list-disc pl-4 space-y-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <li><strong>X:</strong> Age (Independent)</li>
                        <li><strong>Y:</strong> Strength (Dependent)</li>
                      </ul>
                      <p className={`mt-1 italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        <b>Assumption:</b> Strength develops from infancy, peaks in adulthood, then gradually declines.
                      </p>
                    </div>
                    <div>
                      <p className={`font-bold mb-1 ${isDark ? 'text-red-300' : 'text-red-700'}`}>Example 2: Population Density vs. Quality of Life</p>
                      <ul className={`list-disc pl-4 space-y-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <li><strong>X:</strong> Density</li>
                        <li><strong>Y:</strong> Quality of Life</li>
                      </ul>
                      <p className={`mt-1 italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        <b>Assumption:</b> Moderate density is best; extremes are bad.
                      </p>
                    </div>
                  </div>
                  <p className={`text-center font-bold pt-4 mt-auto ${isDark ? 'text-red-400' : 'text-red-600'}`}>“Too much or too little is bad.”</p>
                </div>

                {/* Smile (U-Shape) Card */}
                <div className={`p-4 rounded-xl border flex flex-col h-full ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <MiniChart data={polyShapeData} lineKey="smile" color="#22c55e" title="The 'Smile' (U-Shape)" />
                  {/* NEW LABEL ADDED HERE */}
                  <div className="text-center font-mono text-xs text-slate-500 mb-3 mt-2">
                    Parabola: y = ax² + bx + c, a &gt; 0
                  </div>
                  <div className="mt-2 text-xs flex-grow space-y-4">
                    <div>
                      <p className={`font-bold mb-1 ${isDark ? 'text-green-300' : 'text-green-700'}`}>Example 1: Driver Age vs. Claims</p>
                      <ul className={`list-disc pl-4 space-y-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <li><strong>X:</strong> Age</li>
                        <li><strong>Y:</strong> Claims</li>
                      </ul>
                      <p className={`mt-1 italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        <b>Assumption:</b> Young & old drivers are high risk.
                      </p>
                    </div>
                    <div>
                      <p className={`font-bold mb-1 ${isDark ? 'text-green-300' : 'text-green-700'}`}>Example 2: Fertilizer vs. Health</p>
                      <ul className={`list-disc pl-4 space-y-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <li><strong>X:</strong> Amount</li>
                        <li><strong>Y:</strong> Plant Health</li>
                      </ul>
                      <p className={`mt-1 italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        <b>Assumption:</b> Optimal health requires a specific ("Goldilocks") amount.
                      </p>
                    </div>
                  </div>
                  <p className={`text-center font-bold pt-4 mt-auto ${isDark ? 'text-green-400' : 'text-green-600'}`}>“Extremes are risky/expensive.”</p>
                </div>

                {/* Plateau Card */}
                <div className={`p-4 rounded-xl border flex flex-col h-full ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <MiniChart data={polyShapeData} lineKey="plateau" color="#3b82f6" title="The Plateau Effect" />
                  {/* NEW LABEL ADDED HERE */}
                  <div className="text-center font-mono text-xs text-slate-500 mb-3 mt-2">
                    Plateau: y = L
                  </div>
                  <div className="mt-2 text-xs flex-grow space-y-4">
                    <div>
                      <p className={`font-bold mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Example 1: Learning Time vs. Skill</p>
                      <ul className={`list-disc pl-4 space-y-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <li><strong>X:</strong> Time</li>
                        <li><strong>Y:</strong> Skill</li>
                      </ul>
                      <p className={`mt-1 italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        <b>Assumption:</b> Skill improves fast, then levels off.
                      </p>
                    </div>
                    <div>
                      <p className={`font-bold mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Example 2: Exercise vs. Results</p>
                      <ul className={`list-disc pl-4 space-y-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <li><strong>X:</strong> Effort</li>
                        <li><strong>Y:</strong> Calories</li>
                      </ul>
                      <p className={`mt-1 italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        <b>Assumption:</b> Body adapts, gains slow down.
                      </p>
                    </div>
                  </div>
                  <p className={`text-center font-bold pt-4 mt-auto ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>“Diminishing returns.”</p>
                </div>

                {/* J-Curve (Exponential/Reverse Plateau) Card */}
                <div className={`p-4 rounded-xl border flex flex-col h-full ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <MiniChart data={polyShapeData} lineKey="jCurve" color="#f59e0b" title="The J-Curve (Exponential)" />
                  {/* NEW LABEL ADDED HERE */}
                  <div className="text-center font-mono text-xs text-slate-500 mb-3 mt-2">
                    J-Curve: y = ae<sup>bx</sup>, b &gt; 0
                  </div>
                  <div className="mt-2 text-xs flex-grow space-y-4">
                    <div>
                      <p className={`font-bold mb-1 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>Example 1: Viral Content</p>
                      <ul className={`list-disc pl-4 space-y-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <li><strong>X:</strong> Time</li>
                        <li><strong>Y:</strong> Views</li>
                      </ul>
                      <p className={`mt-1 italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        <b>Assumption:</b> Slow start, then explosive growth.
                      </p>
                    </div>
                    <div>
                      <p className={`font-bold mb-1 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>Example 2: Bacterial Growth</p>
                      <ul className={`list-disc pl-4 space-y-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <li><strong>X:</strong> Time</li>
                        <li><strong>Y:</strong> Count</li>
                      </ul>
                      <p className={`mt-1 italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        <b>Assumption:</b> Population doubles at a constant rate.
                      </p>
                    </div>
                  </div>
                  <p className={`text-center font-bold pt-4 mt-auto ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>“Growth accelerates rapidly.”</p>
                </div>

              </div>
            </div>
        )}

        {/* EDUCATIONAL SECTIONS */}
        <div className={`rounded-xl shadow-inner p-6 mb-6 mt-12 ${isDark ? 'bg-slate-800/50' : 'bg-gradient-to-br from-slate-100 to-slate-200'}`}>
          <h3 className={`text-xl font-bold mb-4 text-center ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>The Goldilocks Problem: Bias vs. Variance</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <MiniChart data={fittingData} lineKey="underfit" color="#ef4444" title="Underfitting (High Bias)" desc="The model is too simple. It ignores the details in your training data." analogy="The Lazy Robot. It looks at data and makes a lazy rule that misses the pattern." />
            <MiniChart data={fittingData} lineKey="optimal" color="#10b981" title="Optimal Fit" desc="Just right. The model learns the general rules but ignores the random noise." analogy="The Smart Robot. It learns the true pattern and ignores the anomalies." />
            <MiniChart data={fittingData} lineKey="overfit" color="#3b82f6" title="Overfitting (High Variance)" desc="The model is obsessed. It memorises the training data including mistakes." analogy="The Obsessive Robot. It memorises every detail including the noise." />
          </div>
          <p className={`my-3 text-center max-w-2xl mx-auto text-sm ${textMuted}`}>The goal of Machine Learning is to find the sweet spot: a model complex enough to capture the true underlying pattern (the signal), yet simple enough to ignore random accidents (noise).</p>
        </div>

        <div className={`rounded-xl shadow-lg p-6 mb-6 ${isDark ? 'bg-amber-900/20' : 'bg-gradient-to-br from-amber-50 to-orange-50'}`}>
          <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-amber-400' : 'text-orange-700'}`}>Understanding the Scatter: Real-World Variation</h3>
          <p className={`mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>In the real world, outcomes aren't ONLY determined by one factor. The scatter represents real-world variation from:</p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className={`font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Individual Factors:</h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                <li>* Negotiation skills</li>
                <li>* Education level</li>
                <li>* Specialisation</li>
                <li>* Performance</li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>External Factors:</h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                <li>* Company size</li>
                <li>* Geographic location</li>
                <li>* Market timing</li>
                <li>* Industry</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className={`rounded-xl shadow-lg p-6 flex flex-col ${isDark ? 'bg-purple-900/20' : 'bg-gradient-to-br from-purple-50 to-pink-50'}`}>
            <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>Ridge Regression</h3>
            <p className={`mb-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Imagine predicting with 50 factors. Ridge says: "Keep all 50 factors, but don't let any one dominate too much"</p>
            <div className={`rounded-lg p-3 mb-3 ${isDark ? 'bg-slate-800' : 'bg-white'}`}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Effect: Prevents overfitting. All factors contribute a little, nothing goes crazy.</p></div>
          </div>
          <div className={`rounded-xl shadow-lg p-6 flex flex-col ${isDark ? 'bg-green-900/20' : 'bg-gradient-to-br from-green-50 to-emerald-50'}`}>
            <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-green-400' : 'text-green-700'}`}>Lasso Regression</h3>
            <p className={`mb-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Same 50 factors, but Lasso is ruthless: it eliminates the weak ones entirely.</p>
            <div className={`rounded-lg p-3 mb-3 ${isDark ? 'bg-slate-800' : 'bg-white'}`}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Effect: Automatic feature selection. Discovers which factors actually matter.</p></div>
          </div>
        </div>

        <div className={`rounded-xl shadow-lg p-6 ${isDark ? 'bg-indigo-900/20' : 'bg-gradient-to-br from-indigo-50 to-purple-50'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>Neural Network Regression Explained</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className={`font-bold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Real-world example:</h4>
              <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Predicting house prices from photos. The neural network learns: Layer 1 detects edges, Layer 2 recognises windows/doors...</p>
            </div>
            <div>
              <h4 className={`font-bold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Why it's powerful:</h4>
              <ul className={`space-y-2 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>* Learns feature combinations automatically</li>
                <li>* Finds hidden patterns humans don't notice</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
};

export default RegressionTab;
