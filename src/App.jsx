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

// --- CLASSIFICATION DATA & MODELS ---
const generateClassificationData = () => {
  const data = [];
  for (let i = 0; i < 50; i++) {
    const experience = Math.random() * 15;
    const skillScore = Math.random() * 100;

    // Decision boundary: hired if (experience * 5 + skillScore) > 60 with some noise
    const score = experience * 5 + skillScore * 0.8;
    const noise = (Math.random() - 0.5) * 30;
    const hired = (score + noise) > 70 ? 1 : 0;

    data.push({
      experience: parseFloat(experience.toFixed(1)),
      skillScore: parseFloat(skillScore.toFixed(0)),
      hired,
      label: hired ? 'Hired ✓' : 'Rejected ✗'
    });
  }
  return data;
};

const classificationModels = {
  logistic: {
    name: 'Logistic Regression',
    color: '#3b82f6',
    parameters: [
      { symbol: 'σ', name: 'Sigmoid Function', value: '1/(1+e⁻ˣ)', context: 'Squashes output to 0-1 probability' },
      { symbol: 'θ', name: 'Threshold', value: '0.5', context: 'Decision boundary for Yes/No' }
    ]
  },
  decisionTree: {
    name: 'Decision Tree',
    color: '#f59e0b',
    parameters: [
      { symbol: 'd', name: 'Max Depth', value: '4', context: 'How many questions to ask' },
      { symbol: 'g', name: 'Gini Impurity', value: '0.0', context: 'Measures "purity" of splits' }
    ]
  },
  randomForest: {
    name: 'Random Forest',
    color: '#059669',
    parameters: [
      { symbol: 'N', name: 'Trees', value: '100', context: 'Number of voters in the committee' },
      { symbol: 'v', name: 'Voting', value: 'Majority', context: 'Most votes wins' }
    ]
  },
  svm: {
    name: 'SVM Classifier',
    color: '#ec4899',
    parameters: [
      { symbol: 'C', name: 'Regularization', value: '1.0', context: 'Tolerance for misclassification' },
      { symbol: 'K', name: 'Kernel', value: 'RBF', context: 'Shape of decision boundary' }
    ]
  },
  knn: {
    name: 'k-NN Classifier',
    color: '#ea580c',
    parameters: [
      { symbol: 'k', name: 'Neighbors', value: '5', context: 'How many neighbors vote' },
      { symbol: 'd', name: 'Distance', value: 'Euclidean', context: 'How we measure "closeness"' }
    ]
  },
  naiveBayes: {
    name: 'Naive Bayes',
    color: '#8b5cf6',
    parameters: [
      { symbol: 'P', name: 'Prior', value: 'P(Class)', context: 'Base rate of each class' },
      { symbol: 'L', name: 'Likelihood', value: 'P(X|Class)', context: 'Probability of features given class' }
    ]
  }
};

const classificationDescriptions = {
  logistic: {
    title: 'Logistic Regression',
    math: 'P(y=1) = σ(wx + b)',
    desc: 'Despite the name, this is for classification! It predicts the probability of belonging to a class (e.g., 73% chance of being hired).',
    when: 'When you need probabilities, not just Yes/No. Great for understanding which factors matter most.',
    howItWorks: 'Uses the sigmoid function to squash any number into a 0-1 probability. If P > 0.5, predict "Yes". The decision boundary is a straight line (or plane in higher dimensions).',
    realExample: 'Email spam detection: "Based on these keywords, there\'s an 89% chance this is spam." You can then decide your own threshold.',
    pros: ['Outputs probabilities (not just labels)', 'Very interpretable coefficients', 'Fast to train', 'Works well with many features'],
    cons: ['Only linear boundaries', 'Struggles with complex patterns', 'Assumes features are independent']
  },
  decisionTree: {
    title: 'Decision Tree Classifier',
    math: 'if feature < threshold → class',
    desc: 'A flowchart of Yes/No questions. "Is experience > 5? Yes → Is skill > 70? Yes → HIRED."',
    when: 'When you need to explain exactly WHY a decision was made. Perfect for HR, loans, medical diagnoses.',
    howItWorks: 'Splits the data by asking the most informative question at each step. Uses Gini impurity or entropy to find the best splits.',
    realExample: 'Loan approval: "Income > £50k? Yes. Debt ratio < 30%? Yes. Credit score > 700? Yes. → APPROVED."',
    pros: ['Crystal clear explanations', 'Handles mixed data types', 'No feature scaling needed', 'Captures non-linear patterns'],
    cons: ['Prone to overfitting', 'Unstable (small data changes = big tree changes)', 'Greedy algorithm (not globally optimal)']
  },
  randomForest: {
    title: 'Random Forest Classifier',
    math: 'mode(Tree₁, Tree₂, ..., Treeₙ)',
    desc: 'An ensemble of Decision Trees that vote. Each tree is trained on a random subset of data and features.',
    when: 'When accuracy matters more than interpretability. The go-to for most classification problems.',
    howItWorks: '100 trees each make a prediction. The class with the most votes wins. Randomness prevents overfitting.',
    realExample: 'Medical diagnosis: 100 "doctors" (trees) vote. 73 say "benign", 27 say "malignant". Diagnosis: Benign (73% confidence).',
    pros: ['Extremely accurate', 'Resistant to overfitting', 'Handles missing data', 'Provides feature importance'],
    cons: ['Black box (hard to explain individual predictions)', 'Slow for real-time predictions', 'Large model size']
  },
  svm: {
    title: 'Support Vector Machine',
    math: 'max margin: ||w||⁻¹',
    desc: 'Finds the widest possible "street" between classes. The street edges are defined by support vectors.',
    when: 'When you have clear separation between classes or high-dimensional data (like text classification).',
    howItWorks: 'Maximizes the margin between classes. Uses kernel trick to handle non-linear boundaries by projecting data into higher dimensions.',
    realExample: 'Classifying handwritten digits. The "street" separates 3s from 8s. Points on the edge (the tricky ones) are the support vectors.',
    pros: ['Works well in high dimensions', 'Memory efficient (only stores support vectors)', 'Effective with clear margins'],
    cons: ['Slow on large datasets', 'Sensitive to feature scaling', 'Hard to interpret', 'No probability output by default']
  },
  knn: {
    title: 'k-Nearest Neighbors',
    math: 'class = mode(k closest points)',
    desc: 'The "birds of a feather" classifier. Looks at your k nearest neighbors and copies their label.',
    when: 'When similar things should have similar labels. Great for recommendation systems and image classification.',
    howItWorks: 'No training! At prediction time, find the k closest data points and let them vote. k=5 means 5 neighbors vote.',
    realExample: 'Netflix: "Users similar to you liked these movies." If 4 out of 5 similar users liked a movie, recommend it.',
    pros: ['No training time', 'Adapts to new data instantly', 'Naturally handles multi-class', 'Intuitive concept'],
    cons: ['Slow predictions (must search all data)', 'Sensitive to irrelevant features', 'Needs feature scaling', 'Curse of dimensionality']
  },
  naiveBayes: {
    title: 'Naive Bayes',
    math: 'P(Class|X) ∝ P(X|Class)P(Class)',
    desc: 'Uses Bayes\' theorem with a "naive" assumption: all features are independent. Surprisingly effective!',
    when: 'Text classification (spam, sentiment). Fast and works well with many features.',
    howItWorks: 'Calculates P(spam | words) using P(words | spam) × P(spam). Assumes each word contributes independently.',
    realExample: 'Spam filter: P(spam | "free", "winner", "click") = P("free"|spam) × P("winner"|spam) × P("click"|spam) × P(spam)',
    pros: ['Extremely fast', 'Works with small data', 'Handles many features', 'Good baseline'],
    cons: ['Independence assumption rarely true', 'Can\'t learn feature interactions', 'Sensitive to rare features']
  }
};

// --- CLASSIFICATION TOOLTIP ---
const ClassificationTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
        <div className={`p-4 rounded-lg shadow-xl border-2 z-50 ${data.hired ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="font-bold text-gray-800 mb-1">{data.experience} years exp, {data.skillScore} skill</p>
          <p className={`font-bold ${data.hired ? 'text-green-600' : 'text-red-600'}`}>
            {data.label}
          </p>
        </div>
    );
  }
  return null;
};

// --- CLASSIFICATION TAB COMPONENT ---
const ClassificationTab = () => {
  const [activeModel, setActiveModel] = useState('logistic');
  const [classificationData, setClassificationData] = useState(generateClassificationData);
  const [showDetails, setShowDetails] = useState(false);

  const handleRegenerate = () => setClassificationData(generateClassificationData());

  const hiredPoints = classificationData.filter(d => d.hired === 1);
  const rejectedPoints = classificationData.filter(d => d.hired === 0);

  const currentModel = classificationModels[activeModel];
  const currentDesc = classificationDescriptions[activeModel];

  // Generate decision boundary line based on model
  const boundaryData = useMemo(() => {
    const points = [];
    for (let exp = 0; exp <= 15; exp += 0.5) {
      let skillThreshold;
      switch(activeModel) {
        case 'logistic':
          skillThreshold = (70 - exp * 5) / 0.8;
          break;
        case 'decisionTree':
          skillThreshold = exp < 5 ? 80 : exp < 10 ? 50 : 30;
          break;
        case 'randomForest':
          skillThreshold = 85 - exp * 4.5 + Math.sin(exp) * 5;
          break;
        case 'svm':
          skillThreshold = 90 - exp * 5 - 0.1 * exp * exp;
          break;
        case 'knn':
          skillThreshold = 80 - exp * 4 + (Math.random() - 0.5) * 10;
          break;
        case 'naiveBayes':
          skillThreshold = 75 - exp * 4;
          break;
        default:
          skillThreshold = 70 - exp * 4;
      }
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

              {/* Decision Boundary Line */}
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

              {/* Hired Points */}
              <Scatter
                  dataKey="skillScore"
                  data={hiredPoints}
                  fill="#22c55e"
                  name="Hired"
                  shape="circle"
              />

              {/* Rejected Points */}
              <Scatter
                  dataKey="skillScore"
                  data={rejectedPoints}
                  fill="#ef4444"
                  name="Rejected"
                  shape="circle"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* PARAMETER DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {currentModel.parameters.map((param, index) => (
              <div key={index} className="bg-white p-4 rounded-xl shadow-md border-l-4 flex flex-col justify-center transition-all hover:shadow-lg" style={{ borderColor: currentModel.color }}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-bold border border-gray-200">{param.symbol}</span>
                    <span className="text-gray-700 font-bold uppercase tracking-wider text-xs">{param.name}</span>
                  </div>
                  <span className="font-mono font-bold text-xl" style={{ color: currentModel.color }}>{param.value}</span>
                </div>
                <p className="text-gray-500 text-sm mt-1 border-t pt-2 border-gray-100 italic">"{param.context}"</p>
              </div>
          ))}
        </div>

        {/* MODEL DESCRIPTION BOX */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold" style={{ color: currentModel.color }}>
                {currentDesc.title}
              </h2>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded border border-gray-200">
              {currentDesc.math}
            </span>
            </div>
            <button onClick={() => setShowDetails(!showDetails)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
              {showDetails ? '- Hide Details' : '+ Show Details'}
            </button>
          </div>

          <p className="text-gray-700 text-lg mb-3">
            {currentDesc.desc}
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
            <p className="text-sm font-semibold text-blue-900">Best used:</p>
            <p className="text-blue-800">{currentDesc.when}</p>
          </div>

          {showDetails && (
              <div className="mt-6 space-y-4 border-t pt-6">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-2">How It Works</h3>
                  <p className="text-gray-700">{currentDesc.howItWorks}</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-2">Real-World Example</h3>
                  <p className="text-gray-700">{currentDesc.realExample}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 h-full flex flex-col">
                    <h3 className="font-bold text-green-800 mb-2">Pros</h3>
                    <ul className="text-sm text-green-900 space-y-1 flex-grow">
                      {currentDesc.pros.map((pro, idx) => <li key={idx}>&bull; {pro}</li>)}
                    </ul>
                  </div>
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 h-full flex flex-col">
                    <h3 className="font-bold text-red-800 mb-2">Cons</h3>
                    <ul className="text-sm text-red-900 space-y-1 flex-grow">
                      {currentDesc.cons.map((con, idx) => <li key={idx}>&bull; {con}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
          )}
        </div>

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

// --- 3. MAIN APP COMPONENT ---
function App() {
  const [activeTab, setActiveTab] = useState('regression');
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

        {/* CLASSIFICATION TAB */}
        {activeTab === 'classification' && <ClassificationTab />}

        {/* REGRESSION TAB (Your Original Content) */}
        {activeTab === 'regression' && (
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

                    <Scatter
                        dataKey="actual"
                        data={normalPoints}
                        fill="#94a3b8"
                        name="Normal Employees"
                        shape="circle"
                        isAnimationActive={true}
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                    />
                    <Scatter
                        dataKey="actual"
                        data={outlierPoints}
                        fill="#ef4444"
                        name="Outliers"
                        shape="circle"
                        r={6}
                        isAnimationActive={true}
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                    />
                    <Line
                        data={chartData}
                        type="monotone"
                        dataKey="predicted"
                        stroke={models[activeModel].color}
                        strokeWidth={3}
                        dot={false}
                        name="Prediction Model"
                        isAnimationActive={true}
                        animationDuration={isManualMode ? 0 : 1200}
                        animationEasing="ease-in-out"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* === 1. MANUAL TUNING SECTION (EXPANDED EXPLANATIONS) === */}
              {activeModel === 'linear' && isManualMode && (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-6 border border-indigo-100 shadow-sm animate-fade-in">
                    <div className="flex flex-col md:flex-row gap-8 items-start">

                      {/* EDUCATIONAL TEXT SIDE */}
                      <div className="md:w-5/12 space-y-4">
                        <h3 className="text-lg font-bold text-indigo-900 border-b border-indigo-200 pb-2">The Math Behind the Line</h3>

                        {/* Weight Explanation */}
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

                        {/* Bias Explanation */}
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

                      {/* SLIDERS SIDE */}
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

              {/* === 2. STATIC PARAMETER DASHBOARD (Visible when NOT manual) === */}
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
                  The goal of Machine Learning is to find the sweet spot: a model complex enough to capture the true
                  underlying pattern (the signal), yet simple enough to ignore random accidents (noise). This
                  often means accepting a small loss in training accuracy in exchange for better reliability and performance
                  on new, unseen data.            </p>
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
        )}

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
