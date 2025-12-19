import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import MiniChart from '../shared/MiniChart';
import { polyShapeData } from '../../data/regressionScenarios';

export const PolynomialEducation = () => {
    const { isDark } = useTheme();

    // Internal card helper for this specific section
    const ShapeCard = ({ title, data, lineKey, color, formula, children }) => (
        <div className={`p-4 rounded-xl border flex flex-col h-full ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
            <MiniChart data={data} lineKey={lineKey} color={color} title={title} />
            <div className="text-center font-mono text-xs text-slate-500 mb-3 mt-2">
                {formula}
            </div>
            <div className="mt-2 text-xs flex-grow space-y-4">
                {children}
            </div>
        </div>
    );

    return (
        <div className={`rounded-xl shadow-inner p-8 mb-16 h-auto ${isDark ? 'bg-slate-800/50' : 'bg-gradient-to-br from-slate-100 to-slate-200'}`}>
            <h3 className={`text-xl font-bold mb-6 text-center ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>
                Understanding Polynomial Shapes: The Power of x²
            </h3>
            <p className={`mb-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Squaring a number produces a curved shape. These curves allow us to model real-world patterns such as growth, decline, and natural limits.
            </p>

            <div className="grid md:grid-cols-4 gap-6 items-stretch">
                <ShapeCard title="The 'Smile' (U-Shape)" data={polyShapeData} lineKey="smile" color="#22c55e" formula="Parabola: y ax² + bx+c, a > 0">
                    <div>
                        <p className={`font-bold mb-1 ${isDark ? 'text-green-300' : 'text-green-700'}`}>Example 1: Driver Age vs. Claims</p>
                        <ul className={`list-disc pl-4 space-y-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <li><strong>X:</strong> Age (Years)</li>
                            <li><strong>Y:</strong> Claims</li>
                        </ul>
                        <p className={`mt-1 italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}><b>Assumption:</b> Young drivers (17-25) have high rates, middle-aged are safest, then elderly (75+) rise again.</p>
                    </div>
                    <div>
                        <p className={`font-bold mb-1 ${isDark ? 'text-green-300' : 'text-green-700'}`}>Example 2: Plant Watering</p>
                        <ul className={`list-disc pl-4 space-y-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <li><strong>X:</strong> Water (mL)</li>
                            <li><strong>Y:</strong> Mortality Rate (%)</li>
                        </ul>
                        <p className={`mt-1 italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}><b>Assumption:</b> Too little kills, right amount is healthy, too much drowns.</p>
                    </div>
                    <p className={`text-center font-bold pt-4 mt-auto ${isDark ? 'text-green-400' : 'text-green-600'}`}>"Extremes are risky."</p>
                </ShapeCard>

                <ShapeCard title="The 'Sad Smile' (Inverted U)" data={polyShapeData} lineKey="frown" color="#ef4444" formula="Parabola: y=ax² + bx+c, a < 0">
                    <div>
                        <p className={`font-bold mb-1 ${isDark ? 'text-red-300' : 'text-red-700'}`}>Example 1: Footballer Performance</p>
                        <ul className={`list-disc pl-4 space-y-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <li><strong>X:</strong> Age (Years)</li>
                            <li><strong>Y:</strong> Performance Level</li>
                        </ul>
                        <p className={`mt-1 italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}><b>Assumption:</b> When young, less experience. Skills peak at 27-30, thenperformance declines as age progresses.</p>
                    </div>
                    <div>
                        <p className={`font-bold mb-1 ${isDark ? 'text-red-300' : 'text-red-700'}`}>Example 2: Daily Temperature</p>
                        <ul className={`list-disc pl-4 space-y-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <li><strong>X:</strong> Daytime (Hours)</li>
                            <li><strong>Y:</strong> Temperature (°C)</li>
                        </ul>
                        <p className={`mt-1 italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}><b>Assumption:</b> Cold at sunrise, peaks at 2-3pm, cools in evening.</p>
                    </div>
                    <p className={`text-center font-bold pt-4 mt-auto ${isDark ? 'text-red-400' : 'text-red-600'}`}>"Rises to a peak, then falls."</p>
                </ShapeCard>

                <ShapeCard title="The Plateau Effect" data={polyShapeData} lineKey="plateau" color="#3b82f6" formula="Plateau: y = a·log(x) + b">
                    <div>
                        <p className={`font-bold mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Example 1: Fire Spreading</p>
                        <ul className={`list-disc pl-4 space-y-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <li><strong>X:</strong> Time (Minutes)</li>
                            <li><strong>Y:</strong> Rooms on Fire</li>
                        </ul>
                        <p className={`mt-1 italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}><b>Assumption:</b> Spreads rapidly at first, slows down as fuel runs out.</p>
                    </div>
                    <div>
                        <p className={`font-bold mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Example 2: City Population</p>
                        <ul className={`list-disc pl-4 space-y-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <li><strong>X:</strong> Years</li>
                            <li><strong>Y:</strong> Population</li>
                        </ul>
                        <p className={`mt-1 italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}><b>Assumption:</b> Grows fast initially, slows as city reaches capacity.</p>
                    </div>
                    <p className={`text-center font-bold pt-4 mt-auto ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>"Diminishing returns."</p>
                </ShapeCard>

                <ShapeCard title="The J-Curve" data={polyShapeData} lineKey="jCurve" color="#f59e0b" formula="J-Curve: y = ae^(bx), b > 0">
                    <div>
                        <p className={`font-bold mb-1 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>Example 1: Compound Interest</p>
                        <ul className={`list-disc pl-4 space-y-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <li><strong>X:</strong> Time</li>
                            <li><strong>Y:</strong> Investment Value</li>
                        </ul>
                        <p className={`mt-1 italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}><b>Assumption:</b> Grows slowly at first, then speeds up (snowball effect).</p>
                    </div>
                    <div>
                        <p className={`font-bold mb-1 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>Example 2: Internet Viral Views</p>
                        <ul className={`list-disc pl-4 space-y-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <li><strong>X:</strong> Time</li>
                            <li><strong>Y:</strong> Views</li>
                        </ul>
                        <p className={`mt-1 italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}><b>Assumption:</b> Starts slow, then explodes exponentially. Or worse still, a shilled crypto coin, typically with a higher parabolic curve.</p>
                    </div>
                    <p className={`text-center font-bold pt-4 mt-auto ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>"Growth accelerates rapidly."</p>
                </ShapeCard>
            </div>
        </div>
    );
};

export const GeneralEducation = ({ fittingData }) => {
    const { isDark, textMuted } = useTheme();
    return (
        <>
            <div className={`rounded-xl shadow-inner p-6 mb-6 mt-12 ${isDark ? 'bg-slate-800/50' : 'bg-gradient-to-br from-slate-100 to-slate-200'}`}>
                <h3 className={`text-xl font-bold mb-4 text-center ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>The Goldilocks Problem: Bias vs. Variance </h3>
                <div className="grid md:grid-cols-3 gap-4">
                    <MiniChart data={fittingData} lineKey="underfit" color="#ef4444" title="Underfitting (High Bias)" desc="Too simple. Ignores details." analogy="The Lazy Robot." />
                    <MiniChart data={fittingData} lineKey="optimal" color="#10b981" title="Optimal Fit" desc="Just right. Ignores noise." analogy="The Smart Robot." />
                    <MiniChart data={fittingData} lineKey="overfit" color="#3b82f6" title="Overfitting (High Variance)" desc="Obsessed with noise." analogy="The Obsessive Robot." />
                </div>
                <p className={`my-3 text-center max-w-2xl mx-auto text-sm ${textMuted}`}>The goal is to find the sweet spot between simple and complex.</p>
            </div>

            <div className={`rounded-xl shadow-lg p-6 mb-6 ${isDark ? 'bg-amber-900/20' : 'bg-gradient-to-br from-amber-50 to-orange-50'}`}>
                <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-amber-400' : 'text-orange-700'}`}>Understanding the Scatter: Real-World Variation</h3>
                <p className={`mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Outcomes aren't ONLY determined by one factor. The scatter represents variation from:</p>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <h4 className={`font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Individual Factors:</h4>
                        <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                            <li>* Negotiation skills</li>
                            <li>* Education level</li>
                            <li>* Specialisation</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className={`font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>External Factors:</h4>
                        <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                            <li>* Company size</li>
                            <li>* Geographic location</li>
                            <li>* Market timing</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className={`rounded-xl shadow-lg p-6 flex flex-col ${isDark ? 'bg-purple-900/20' : 'bg-gradient-to-br from-purple-50 to-pink-50'}`}>
                    <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>Ridge Regression</h3>
                    <p className={`mb-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Imagine predicting with 50 factors. Ridge says: "Keep all 50 factors, but don't let any one dominate."</p>
                    <div className={`rounded-lg p-3 mb-3 ${isDark ? 'bg-slate-800' : 'bg-white'}`}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Effect: Prevents overfitting. All factors contribute a little.</p></div>
                </div>
                <div className={`rounded-xl shadow-lg p-6 flex flex-col ${isDark ? 'bg-green-900/20' : 'bg-gradient-to-br from-green-50 to-emerald-50'}`}>
                    <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-green-400' : 'text-green-700'}`}>Lasso Regression</h3>
                    <p className={`mb-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Same 50 factors, but Lasso is ruthless: it eliminates the weak ones entirely.</p>
                    <div className={`rounded-lg p-3 mb-3 ${isDark ? 'bg-slate-800' : 'bg-white'}`}><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Effect: Automatic feature selection. Discovers what matters.</p></div>
                </div>
            </div>

            <div className={`rounded-xl shadow-lg p-6 ${isDark ? 'bg-indigo-900/20' : 'bg-gradient-to-br from-indigo-50 to-purple-50'}`}>
                <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>Neural Network Regression Explained

                    [Image of neural network architecture]
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className={`font-bold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Real-world example:</h4>
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Predicting house prices from photos. The network learns: Layer 1 detects edges, Layer 2 recognises windows...</p>
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
        </>
    );
};
