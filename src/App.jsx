// src/App.jsx
import React, { useState } from 'react';
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function App() {
  const [activeModel, setActiveModel] = useState('linear');
  const [showDetails, setShowDetails] = useState(false);

  // Real world data: Years of experience vs Salary
  // Simulating realistic tech industry patterns
  const generateData = () => {
    const data = [];
    for (let experience = 0; experience <= 20; experience++) {
      // Base salary pattern: starts at 45k, rapid growth early on,
      // then plateaus as you reach senior levels
      const baseSalary = 45 + 15 * experience - 0.3 * experience * experience;

      // Real world noise: salary isn't perfect. It varies by negotiation, luck, etc.
      // Represents +/- 10k variance
      const realWorldVariation = (Math.random() - 0.5) * 20;

      const salary = baseSalary + realWorldVariation;

      data.push({
        experience,
        actual: Math.max(salary, 40) // minimum salary floor
      });
    }
    return data;
  };

  // Keep data consistent across renders so k-NN doesn't jump around
  const [rawData] = useState(generateData());

  // Linear - The "best fit line" approach
  const linearFit = rawData.map(d => ({
    ...d,
    predicted: 45 + 5 * d.experience
  }));

  // Polynomial - Adding a curve to catch the early career growth
  const polynomialFit = rawData.map(d => ({
    ...d,
    predicted: 45 + 15 * d.experience - 0.3 * d.experience * d.experience
  }));

  // Decision Tree - Splitting people into buckets (Junior, Mid, Senior)
  const decisionTreeFit = rawData.map(d => {
    let predicted;
    if (d.experience < 2) predicted = 50; // Junior band
    else if (d.experience < 5) predicted = 75; // Mid-level band
    else if (d.experience < 10) predicted = 105; // Senior band
    else if (d.experience < 15) predicted = 120; // Lead band
    else predicted = 130; // Principal band
    return { ...d, predicted };
  });

  // Random Forest - Averaging out multiple trees to smooth the steps
  const randomForestFit = rawData.map(d => {
    // Tree 1 (Granular view)
    let p1 = d.experience < 3 ? 55 : d.experience < 8 ? 90 : d.experience < 14 ? 115 : 125;
    // Tree 2 (Broad view)
    let p2 = d.experience < 5 ? 60 : d.experience < 12 ? 100 : 130;
    // Tree 3 (Early career bias)
    let p3 = d.experience < 2 ? 45 : d.experience < 6 ? 80 : d.experience < 10 ? 110 : 128;

    // The prediction is just the average of these different viewpoints
    return { ...d, predicted: (p1 + p2 + p3) / 3 };
  });

  // SVM - Trying to fit a "tube" around the data points
  const svmFit = rawData.map(d => ({
    ...d,
    // Simulating an RBF kernel curve - smooth and robust
    predicted: 48 + 14.5 * d.experience - 0.28 * d.experience * d.experience
  }));

  // k-NN - "What are people similar to me earning?"
  const knnFit = rawData.map((targetPoint) => {
    // Calculate distance to every other person in the dataset
    const withDistances = rawData.map(d => ({
      ...d,
      distance: Math.abs(d.experience - targetPoint.experience)
    }));

    // Grab the 3 closest matches
    const k = 3;
    const neighbors = withDistances.sort((a, b) => a.distance - b.distance).slice(0, k);

    // Average their actual salaries
    const avgSalary = neighbors.reduce((sum, n) => sum + n.actual, 0) / k;

    return { ...targetPoint, predicted: avgSalary };
  });

  // Neural Network - The heavy lifter, finding complex/hidden patterns
  const neuralNetFit = rawData.map(d => ({
    ...d,
    predicted: 45 + 15 * d.experience - 0.3 * d.experience * d.experience +
        3 * Math.sin(d.experience * 0.4) // Captures subtle market cycles
  }));

  const models = {
    linear: { data: linearFit, name: 'Linear Regression', color: '#3b82f6' },
    polynomial: { data: polynomialFit, name: 'Polynomial Regression', color: '#10b981' },
    tree: { data: decisionTreeFit, name: 'Decision Tree', color: '#f59e0b' },
    forest: { data: randomForestFit, name: 'Random Forest', color: '#059669' },
    svm: { data: svmFit, name: 'SVM', color: '#ec4899' },
    knn: { data: knnFit, name: 'k-NN (k=3)', color: '#ea580c' },
    neural: { data: neuralNetFit, name: 'Neural Network', color: '#8b5cf6' }
  };

  const descriptions = {
    linear: {
      title: 'Linear Regression',
      desc: 'The simplest approach. It assumes salary is a straight line upwards: &pound;5k extra for every year you work. It ignores the fact that growth usually slows down later in your career.',
      when: 'Great for simple trends, but life is rarely a straight line.',
      howItWorks: 'It draws a straight line (y = mx + b) right through the middle of the mess. It looks at the scattered dots (real people) and finds the average path. If you have 5 years experience, it predicts &pound;70k, ignoring that some people make &pound;60k and others &pound;80k.',
      realExample: 'It\'s like saying "Every year adds exactly &pound;5k to your worth." Simple, easy to explain, but often too simple for the real world.',
      visualPattern: 'A straight diagonal line. The dots are scattered all around it, showing the "noise" of real life.',
      pros: ['Super easy to explain', 'Calculates instantly', 'Hard to break (doesn\'t overfit)', 'Great baseline to start with'],
      cons: ['Misses curves (like career plateaus)', 'Too rigid for complex data', 'Oversimplifies reality']
    },
    polynomial: {
      title: 'Polynomial Regression',
      desc: 'Now we\'re adding curves. This model understands that you learn fast in the beginning (salary spikes) but eventually hit a ceiling (salary plateau).',
      when: 'When the trend clearly isn\'t straight (e.g. rapid growth then slowing down).',
      howItWorks: 'Instead of just x (years), we use x&sup2; or x&sup3;. This lets the line bend. It fits the "inverted U" shape of a typical career path much better than a straight line.',
      realExample: 'Junior devs get big raises fast. Principal devs get smaller percentage raises. This model captures that changing speed.',
      visualPattern: 'A smooth curve that climbs steep and then flattens out. It follows the "shape" of the data better.',
      pros: ['Fits curved patterns nicely', 'Still fairly easy to interpret', 'Matches natural growth cycles'],
      cons: ['Can go wild at the edges (extrapolation)', 'If you add too many curves, it gets messy', 'Harder to explain the math']
    },
    tree: {
      title: 'Decision Tree Regression',
      desc: 'Think of this like an HR flowchart. It creates strict salary bands based on experience brackets: Junior, Mid, Senior, Lead.',
      when: 'When you need clear-cut rules that humans can easily follow.',
      howItWorks: 'It asks questions: "Less than 2 years? Pay &pound;50k. Less than 5? Pay &pound;75k." It doesn\'t care about the specific year, just which bucket you fall into.',
      realExample: 'Exactly like job ads: "3-5 years experience: &pound;75k-&pound;85k." It groups everyone in that range together.',
      visualPattern: 'Steps or stairs. Flat lines that jump suddenly. It doesn\'t look natural, but it\'s very logical.',
      pros: ['Crystal clear logic', 'Handles outliers well', 'Mimics human decision making', 'No complex math needed'],
      cons: ['Unrealistic jumps (4.9 years vs 5.0 years)', 'Can be unstable', 'Misses the nuance of individual years']
    },
    forest: {
      title: 'Random Forest',
      desc: 'This is just a team of Decision Trees working together. We ask 100 different trees to guess the salary, then take the average. It smooths out the edges.',
      when: 'When accuracy matters more than having a simple formula.',
      howItWorks: 'One tree might obsess over early career, another over late career. By averaging them (the "ensemble"), we get rid of the biases and get a solid prediction.',
      realExample: 'It\'s like asking 50 different managers what they\'d pay you and taking the average. You get a much fairer number than asking just one person.',
      visualPattern: 'Jagged steps, but much smaller and smoother than a single Tree. It starts to look like a curve.',
      pros: ['Extremely accurate', 'Very robust (hard to fool)', 'Handles messy data brilliantly'],
      cons: ['Total "black box" (hard to see why it decided X)', 'Slow to train', 'Computer heavy']
    },
    svm: {
      title: 'Support Vector Machine (SVM)',
      desc: 'Imagine trying to wrap a wide rubber band around your data points. SVM tries to find the "tube" that fits the most points comfortably.',
      when: 'When you have lots of different factors (dimensions) and need a robust curve.',
      howItWorks: 'It uses a "kernel trick" to project the data into higher dimensions to find the best fit. It cares more about the general flow than individual outliers.',
      realExample: 'It ignores the guy making &pound;200k with 2 years experience (the outlier) to focus on where the majority of people sit.',
      visualPattern: 'A smooth, stiff curve. It feels "tighter" and often more conservative than the Polynomial.',
      pros: ['Great for high-dimensional data', 'Ignores extreme outliers', 'Very flexible'],
      cons: ['Painful to tune (gamma, epsilon, etc.)', 'Slow on big datasets', 'Math is scary']
    },
    knn: {
      title: 'k-Nearest Neighbors (k-NN)',
      desc: 'The copycat method. "Show me the 3 people most similar to this candidate, and I\'ll guess their salary based on them."',
      when: 'When local similarity matters more than a global trend.',
      howItWorks: 'If you have 7 years experience, it ignores the Juniors and Principals. It finds the nearest existing employees (e.g. 6.8, 7.0, 7.2 years) and averages their pay.',
      realExample: 'Real estate agents do this: "This house is worth X because the 3 houses next door sold for X."',
      visualPattern: 'A wobbly, jagged line. It reacts to every local cluster of dots. If there\'s a random high earner, the line bumps up right there.',
      pros: ['Zero training time', 'Very intuitive concept', 'Adapts to local changes instantly'],
      cons: ['Slow when you have to predict', 'Gets confused by useless data', 'Sensitive to noise']
    },
    neural: {
      title: 'Neural Network Regression',
      desc: 'The brain approach. Layers of "neurons" learn complex, hidden patterns—like how market cycles or specific skill combos affect pay.',
      when: 'When you have massive data and the relationship is too complex for simple math.',
      howItWorks: 'Data goes in, flows through layers of calculations, and salary comes out. It learns its own rules. It can spot things we miss, like "Salary dips at year 5 then spikes at year 7".',
      realExample: 'It\'s like an experienced recruiter who just "knows" a salary based on a thousand tiny factors they can\'t even explain.',
      visualPattern: 'A smooth but wavy curve. It follows the trend but captures subtle oscillations and shifts that others miss.',
      pros: ['Unbeatable on complex tasks', 'Learns hidden features', 'Gets smarter with more data'],
      cons: ['Needs thousands of examples', 'Total black box', 'Can overthink it (overfit) if you aren\'t careful']
    }
  };

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

          {/* Chart */}
          <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={models[activeModel].data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                    dataKey="experience"
                    label={{ value: 'Years of Experience', position: 'insideBottom', offset: -5 }}
                    stroke="#6b7280"
                />
                <YAxis
                    label={{ value: 'Salary (&pound;1000s)', angle: -90, position: 'insideLeft' }}
                    stroke="#6b7280"
                    domain={[30, 140]}
                />
                <Tooltip
                    formatter={(value, name) => {
                      if (name === 'actual') return [`&pound;${Math.round(value)}k`, 'Actual Salary'];
                      return [`&pound;${Math.round(value)}k`, 'Predicted Salary'];
                    }}
                    labelFormatter={(label) => `${label} years experience`}
                />
                <Scatter
                    data={models[activeModel].data}
                    fill="#94a3b8"
                    name="actual"
                    shape="circle"
                />
                <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke={models[activeModel].color}
                    strokeWidth={3}
                    dot={true}
                    name="predicted"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-2xl font-bold" style={{ color: models[activeModel].color }}>
                {descriptions[activeModel].title}
              </h2>
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
              &copy; 2024 <span className="font-semibold">Ricki Angel</span> | <span className="font-semibold text-indigo-600">Tech Angel X</span>
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
