import React, { useState, useMemo, useEffect } from 'react';
// Ensure these paths are correct!
import { generateData, calculateModelFits, descriptions, generateFittingExamples } from '../data/regressionModels';
import { contextData, presetScenarios } from '../data/regressionScenarios';
import { useTheme } from '../context/ThemeContext';

// Components
import RegressionChart from './regression/RegressionChart';
import { PolynomialEducation, GeneralEducation } from './regression/RegressionEducation';
import ParameterCard from './shared/ParameterCard';
import ModelDescription from './shared/ModelDescription';
import CurvatureTuner from './CurvatureTuner';
import DataUploadButton from './shared/DataUploadButton';

const RegressionTab = () => {
  const { isDark, bgCard, text, textMuted, border } = useTheme();

  // --- STATE ---
  const [activeModel, setActiveModel] = useState('linear');
  const [activeScenario, setActiveScenario] = useState('salary');

  const [customX, setCustomX] = useState('X Value');
  const [customY, setCustomY] = useState('Y Value');

  // Safe initialization: ensure generateData returns an array, or fallback to empty array
  const [rawData, setRawData] = useState(() => {
    const init = generateData ? generateData() : [];
    return Array.isArray(init) ? init : [];
  });

  const [fittingData] = useState(generateFittingExamples);

  const [isManualMode, setIsManualMode] = useState(false);
  const [manualSlope, setManualSlope] = useState(5);
  const [manualIntercept, setManualIntercept] = useState(40);
  const [squaredTerm, setSquaredTerm] = useState(-0.5);

  // --- MATH HELPERS (Safe) ---
  const fitLinearRegression = (data) => {
    if (!data || data.length < 2) return { m: 1, b: 0 }; // Safe guard

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const n = data.length;

    data.forEach(p => {
      // Ensure properties exist
      const x = p.experience || 0;
      const y = p.actual || 0;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });

    const denominator = (n * sumXX - sumX * sumX);
    if (denominator === 0) return { m: 0, b: sumY / n };

    const m = (n * sumXY - sumX * sumY) / denominator;
    const b = (sumY - m * sumX) / n;
    return { m, b };
  };

  const fitQuadraticRegression = (data) => {
    if (!data || data.length < 3) return { a: 0, b: 1, c: 0 }; // Safe guard

    let sx = 0, sx2 = 0, sx3 = 0, sx4 = 0, sy = 0, sxy = 0, sx2y = 0;
    const n = data.length;

    data.forEach(p => {
      const x = p.experience || 0;
      const y = p.actual || 0;
      sx += x;
      sx2 += x * x;
      sx3 += x * x * x;
      sx4 += x * x * x * x;
      sy += y;
      sxy += x * y;
      sx2y += x * x * y;
    });

    const D = n * (sx2 * sx4 - sx3 * sx3) - sx * (sx * sx4 - sx2 * sx3) + sx2 * (sx * sx3 - sx2 * sx2);
    if (D === 0) return { a: 0, b: 0, c: 0 };

    const Da = sy * (sx2 * sx4 - sx3 * sx3) - sx * (sxy * sx4 - sx2y * sx3) + sx2 * (sxy * sx3 - sx2y * sx2);
    const Db = n * (sxy * sx4 - sx2y * sx3) - sy * (sx * sx4 - sx2 * sx3) + sx2 * (sx * sx2y - sx2 * sxy);
    const Dc = n * (sx2 * sx2y - sx3 * sxy) - sx * (sx * sx2y - sx2 * sxy) + sy * (sx * sx3 - sx2 * sx2);

    return { a: Da / D, b: Db / D, c: Dc / D };
  };

  // --- LOGIC ---
  const scenario = useMemo(() => {
    const s = presetScenarios[activeScenario];
    if (activeScenario === 'custom') return { ...s, xLabel: customX, yLabel: customY };
    if (['plantGrowth', 'memeAdoption'].includes(activeScenario)) return { ...s, currency: '' };
    return { ...s, currency: '£' };
  }, [activeScenario, customX, customY]);

  const currentContext = contextData[activeScenario] || contextData.custom;

  const handleRegenerate = () => {
    setRawData(generateData());
    if (activeScenario === 'custom') setActiveScenario('salary');
    setManualSlope(5);
    setManualIntercept(40);
    setSquaredTerm(-0.5);
  };

  const handleDataUpload = (payload) => {
    if (!payload) return;

    let incomingData = [];
    let newXLabel = 'X Value';
    let newYLabel = 'Y Value';

    if (Array.isArray(payload)) {
      incomingData = payload;
    } else if (payload.data && Array.isArray(payload.data)) {
      incomingData = payload.data;
      newXLabel = payload.xLabel || newXLabel;
      newYLabel = payload.yLabel || newYLabel;
    } else {
      console.error("Invalid data format received");
      return;
    }

    const formattedData = incomingData.map((point, index) => ({
      id: index,
      experience: point.x,
      actual: point.y,
      isOutlier: false,
      label: { custom: `Row ${index + 1}` }
    }));

    const { m, b } = fitLinearRegression(formattedData);

    setRawData(formattedData);
    setActiveScenario('custom');
    setCustomX(newXLabel);
    setCustomY(newYLabel);
    setManualSlope(Number(m.toFixed(2)));
    setManualIntercept(Number(b.toFixed(2)));
    setIsManualMode(false);
  };

  const models = useMemo(() => calculateModelFits(rawData, activeScenario), [rawData, activeScenario]);

  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];

    if (activeModel === 'linear') {
      const fit = fitLinearRegression(rawData);
      const slope = isManualMode ? manualSlope : fit.m;
      const intercept = isManualMode ? manualIntercept : fit.b;

      return rawData.map(d => ({
        ...d,
        predicted: intercept + (slope * d.experience)
      }));
    }

    if (activeModel === 'polynomial') {
      let a, b, c;
      if (isManualMode) {
        const xMax = rawData.length > 0 ? Math.max(...rawData.map(p => p.experience)) : 20;
        const xCenter = xMax / 2;
        a = squaredTerm / 10;
        b = manualSlope - (2 * a * xCenter);
        c = manualIntercept + (a * xCenter * xCenter) - (manualSlope * xCenter);
      } else {
        const fit = fitQuadraticRegression(rawData);
        a = fit.a;
        b = fit.b;
        c = fit.c;
      }
      return rawData.map(d => ({
        ...d,
        predicted: (a * d.experience * d.experience) + (b * d.experience) + c
      }));
    }

    // Safety check for other models
    return models[activeModel]?.data || [];
  }, [activeModel, isManualMode, rawData, manualSlope, manualIntercept, models, squaredTerm]);

  const normalPoints = chartData.filter(d => !d.isOutlier);
  const outlierPoints = chartData.filter(d => d.isOutlier);

  useEffect(() => {
    if (['tree', 'forest', 'svm', 'knn', 'neural'].includes(activeModel)) {
      setIsManualMode(false);
    }
  }, [activeModel]);

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
          {/* Safety Check: ensure models[key] exists */}
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
                <span className="text-2xl">{model?.icon}</span>
                <span className="text-xs">{model?.name}</span>
              </button>
          ))}
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap justify-between items-center mb-4 px-2 gap-4">
          <div className="flex gap-4 text-sm font-medium">
            <div className="flex items-center gap-1"><span className={`w-3 h-3 rounded-full ${isDark ? 'bg-slate-500' : 'bg-slate-400'}`}></span><span className={textMuted}>Normal</span></div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span><span className="text-red-500">Outlier</span></div>
            <div className="flex items-center gap-1"><span className="w-6 h-1 rounded" style={{ backgroundColor: models[activeModel]?.color || '#888' }}></span><span style={{ color: models[activeModel]?.color || '#888' }}>Prediction</span></div>
          </div>

          <div className="flex items-center gap-3">
            {['linear', 'polynomial'].includes(activeModel) && (
                <div className={`flex items-center rounded-full px-1 py-1 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <button onClick={() => setIsManualMode(false)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!isManualMode ? 'bg-blue-100 text-blue-700' : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>Auto</button>
                  <button onClick={() => setIsManualMode(true)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isManualMode ? 'bg-indigo-600 text-white shadow' : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>Manual Tune</button>
                </div>
            )}

            {activeModel === 'polynomial' && <CurvatureTuner w2={squaredTerm} setW2={setSquaredTerm} />}

            <div className="flex items-center gap-2 border-l pl-3 border-slate-600">
              <DataUploadButton onUpload={handleDataUpload} />
              <button onClick={handleRegenerate} className={`p-2 rounded-full transition-all shadow-md ml-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400' : 'bg-white hover:bg-indigo-50 text-indigo-600'}`} title="Shuffle Outliers"><span className="text-xl">🎲</span></button>
              <button onClick={handleRegenerate} className="flex items-center gap-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg px-5 py-2.5 rounded-full transform hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/></svg>
                Regenerate
              </button>
            </div>
          </div>
        </div>

        {/* CHART */}
        <RegressionChart
            chartData={chartData}
            normalPoints={normalPoints}
            outlierPoints={outlierPoints}
            scenario={scenario}
            modelColor={models[activeModel]?.color || '#888'}
            isManualMode={isManualMode}
        />

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
                    <input
                        type="range"
                        min={manualSlope < 0 ? manualSlope * 2 : 0}
                        max={manualSlope > 10 ? manualSlope * 3 : 10}
                        step={Math.abs(manualSlope) > 50 ? 1 : 0.1}
                        value={manualSlope}
                        onChange={(e) => setManualSlope(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Bias / Intercept (b)</label>
                      <span className="font-mono text-blue-500 font-bold text-lg">{manualIntercept}</span>
                    </div>
                    <input
                        type="range"
                        min={manualIntercept < 0 ? manualIntercept * 2 : 0}
                        max={manualIntercept > 100 ? manualIntercept * 3 : 100}
                        step={Math.abs(manualIntercept) > 100 ? 1 : 1}
                        value={manualIntercept}
                        onChange={(e) => setManualIntercept(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* PARAMETERS (AUTO MODE) */}
        {!isManualMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {activeModel === 'linear' ? (
                  <>
                    <ParameterCard param={{label: "Calculated Slope (w)", value: fitLinearRegression(rawData).m.toFixed(2), desc: "Rate of change (Best Fit)"}} color={models.linear?.color} />
                    <ParameterCard param={{label: "Calculated Intercept (b)", value: fitLinearRegression(rawData).b.toFixed(2), desc: "Starting value (Best Fit)"}} color={models.linear?.color} />
                  </>
              ) : activeModel === 'polynomial' ? (
                  <>
                    <ParameterCard param={{label: "Quad Term (a)", value: fitQuadraticRegression(rawData).a.toFixed(4), desc: "Curvature strength"}} color={models.polynomial?.color} />
                    <ParameterCard param={{label: "Calculated Intercept (c)", value: fitQuadraticRegression(rawData).c.toFixed(2), desc: "Y-Intercept"}} color={models.polynomial?.color} />
                  </>
              ) : (
                  models[activeModel]?.parameters
                      ?.filter(param => param.label !== 'Squared Term')
                      .map((param, index) => (
                          <ParameterCard key={index} param={param} color={models[activeModel].color} />
                      ))
              )}
            </div>
        )}

        <div className="mt-8">
          <ModelDescription {...descriptions[activeModel]} color={models[activeModel]?.color} />
        </div>

        {activeModel === 'polynomial' && <PolynomialEducation />}
        <GeneralEducation fittingData={fittingData} />
      </div>
  );
};

export default RegressionTab;
