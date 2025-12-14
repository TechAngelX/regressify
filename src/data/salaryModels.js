// src/data/salaryModels.js

// 1. DATA GENERATION
export const generateData = () => {
    const data = [];
    for (let experience = 0; experience <= 20; experience++) {
        // Base salary pattern: starts at 45k, rapid growth early on,
        // then plateaus as you reach senior levels
        const baseSalary = 45 + 15 * experience - 0.3 * experience * experience;

        // Real world noise
        let realWorldVariation = (Math.random() - 0.5) * 20;
        let label = null;       // Default: no special label
        let isOutlier = false;  // Default: normal employee

        // --- STORYTELLING OUTLIERS ---

        // Outlier 1: The "Rockstar Junior" (Year 2)
        if (experience === 2) {
            realWorldVariation += 45;
            isOutlier = true;
            label = "The Rockstar Junior: 22 years old, hired by a crypto startup. Knows Rust & AI. Earns way above market rate.";
        }

        // Outlier 2: The "Stagnant Senior" (Year 16)
        if (experience === 16) {
            realWorldVariation -= 35;
            isOutlier = true;
            label = "The Stagnant Senior: Stayed at the same legacy bank for 15 years. No new skills (Cobol/Java 7). Salary drifted below inflation.";
        }
        // -----------------------------

        const salary = baseSalary + realWorldVariation;

        data.push({
            experience,
            actual: Math.max(salary, 40), // minimum salary floor
            label,
            isOutlier
        });
    }
    return data;
};

// 2. MODEL CALCULATIONS
export const calculateModelFits = (rawData) => {

    // Linear
    const linearFit = rawData.map(d => ({
        ...d,
        predicted: 45 + 5 * d.experience
    }));

    // Polynomial
    const polynomialFit = rawData.map(d => ({
        ...d,
        predicted: 45 + 15 * d.experience - 0.3 * d.experience * d.experience
    }));

    // Decision Tree
    const decisionTreeFit = rawData.map(d => {
        let predicted;
        if (d.experience < 2) predicted = 50;
        else if (d.experience < 5) predicted = 75;
        else if (d.experience < 10) predicted = 105;
        else if (d.experience < 15) predicted = 120;
        else predicted = 130;
        return { ...d, predicted };
    });

    // Random Forest (Averaging)
    const randomForestFit = rawData.map(d => {
        let p1 = d.experience < 3 ? 55 : d.experience < 8 ? 90 : d.experience < 14 ? 115 : 125;
        let p2 = d.experience < 5 ? 60 : d.experience < 12 ? 100 : 130;
        let p3 = d.experience < 2 ? 45 : d.experience < 6 ? 80 : d.experience < 10 ? 110 : 128;
        return { ...d, predicted: (p1 + p2 + p3) / 3 };
    });

    // Gradient Boosting (Sequential Correction)
    const boostingFit = rawData.map(d => {
        let base = d.experience < 5 ? 60 : 110;
        let correction1 = d.experience > 2 && d.experience < 7 ? 15 : 0;
        let correction2 = d.experience > 12 ? 15 : 0;
        let outlierCatch = d.experience === 2 ? 15 : 0;
        return { ...d, predicted: base + correction1 + correction2 + outlierCatch };
    });

    // SVM
    const svmFit = rawData.map(d => ({
        ...d,
        predicted: 48 + 14.5 * d.experience - 0.28 * d.experience * d.experience
    }));

    // k-NN
    const knnFit = rawData.map((targetPoint) => {
        const withDistances = rawData.map(d => ({
            ...d,
            distance: Math.abs(d.experience - targetPoint.experience)
        }));
        const k = 3;
        const neighbors = withDistances.sort((a, b) => a.distance - b.distance).slice(0, k);
        const avgSalary = neighbors.reduce((sum, n) => sum + n.actual, 0) / k;
        return { ...targetPoint, predicted: avgSalary };
    });

    // Neural Network
    const neuralNetFit = rawData.map(d => ({
        ...d,
        predicted: 45 + 15 * d.experience - 0.3 * d.experience * d.experience +
            3 * Math.sin(d.experience * 0.4)
    }));

    return {
        linear: { data: linearFit, name: 'Linear Regression', color: '#3b82f6' },
        polynomial: { data: polynomialFit, name: 'Polynomial Regression', color: '#10b981' },
        tree: { data: decisionTreeFit, name: 'Decision Tree', color: '#f59e0b' },
        forest: { data: randomForestFit, name: 'Random Forest', color: '#059669' },
        boosting: { data: boostingFit, name: 'Gradient Boosting', color: '#be123c' },
        svm: { data: svmFit, name: 'SVM', color: '#ec4899' },
        knn: { data: knnFit, name: 'k-NN (k=3)', color: '#ea580c' },
        neural: { data: neuralNetFit, name: 'Neural Network', color: '#8b5cf6' }
    };
};

// 3. TEXT CONTENT
export const descriptions = {
    linear: {
        title: 'Linear Regression',
        math: 'y = mx + c',
        desc: 'The simplest approach. It assumes salary is a straight line upwards: £5k extra for every year you work. It ignores the fact that growth usually slows down later in your career.',
        when: 'Great for simple trends, but life is rarely a straight line.',
        howItWorks: 'It draws a straight line (y = mx + b) right through the middle of the mess. It looks at the scattered dots (real people) and finds the average path. If you have 5 years experience, it predicts £70k, ignoring that some people make £60k and others £80k.',
        realExample: 'It\'s like saying "Every year adds exactly £5k to your worth." Simple, easy to explain, but often too simple for the real world.',
        visualPattern: 'A straight diagonal line. The dots are scattered all around it, showing the "noise" of real life.',
        pros: ['Super easy to explain', 'Calculates instantly', 'Hard to break (doesn\'t overfit)', 'Great baseline to start with'],
        cons: ['Misses curves (like career plateaus)', 'Too rigid for complex data', 'Oversimplifies reality']
    },
    polynomial: {
        title: 'Polynomial Regression',
        math: 'y = ax² + bx + c',
        desc: 'Now we\'re adding curves. This model understands that you learn fast in the beginning (salary spikes) but eventually hit a ceiling (salary plateau).',
        when: 'When the trend clearly isn\'t straight (e.g. rapid growth then slowing down).',
        howItWorks: 'Instead of just x (years), we use x² or x³. This lets the line bend. It fits the "inverted U" shape of a typical career path much better than a straight line.',
        realExample: 'Junior devs get big raises fast. Principal devs get smaller percentage raises. This model captures that changing speed.',
        visualPattern: 'A smooth curve that climbs steep and then flattens out. It follows the "shape" of the data better.',
        pros: ['Fits curved patterns nicely', 'Still fairly easy to interpret', 'Matches natural growth cycles'],
        cons: ['Can go wild at the edges (extrapolation)', 'If you add too many curves, it gets messy', 'Harder to explain the math']
    },
    tree: {
        title: 'Decision Tree Regression',
        math: 'if (x < a) then y = b',
        desc: 'Think of this like an HR flowchart. It creates strict salary bands based on experience brackets: Junior, Mid, Senior, Lead.',
        when: 'When you need clear-cut rules that humans can easily follow.',
        howItWorks: 'It asks questions: "Less than 2 years? Pay £50k. Less than 5? Pay £75k." It doesn\'t care about the specific year, just which bucket you fall into.',
        realExample: 'Exactly like job ads: "3-5 years experience: £75k-£85k." It groups everyone in that range together.',
        visualPattern: 'Steps or stairs. Flat lines that jump suddenly. It doesn\'t look natural, but it\'s very logical.',
        pros: ['Crystal clear logic', 'Handles outliers well', 'Mimics human decision making', 'No complex math needed'],
        cons: ['Unrealistic jumps (4.9 years vs 5.0 years)', 'Can be unstable', 'Misses the nuance of individual years']
    },
    forest: {
        title: 'Random Forest',
        math: 'avg(Tree₁, Tree₂, ...)',
        desc: 'This is just a team of Decision Trees working together. We ask 100 different trees to guess the salary, then take the average. It smooths out the edges.',
        when: 'When accuracy matters more than having a simple formula.',
        howItWorks: 'One tree might obsess over early career, another over late career. By averaging them (the "ensemble"), we get rid of the biases and get a solid prediction.',
        realExample: 'It\'s like asking 50 different managers what they\'d pay you and taking the average. You get a much fairer number than asking just one person.',
        visualPattern: 'Jagged steps, but much smaller and smoother than a single Tree. It starts to look like a curve.',
        pros: ['Extremely accurate', 'Very robust (hard to fool)', 'Handles messy data brilliantly'],
        cons: ['Total "black box" (hard to see why it decided X)', 'Slow to train', 'Computer heavy']
    },
    boosting: {
        title: 'Gradient Boosting (e.g. XGBoost)',
        math: 'y = Tree₁ + ε₁ + ε₂',
        desc: 'The perfectionist. Instead of averaging random trees (like a Forest), it builds trees one by one, where each new tree tries to fix the mistakes of the previous one.',
        when: 'When you want to win a competition. It is the gold standard for tabular data.',
        howItWorks: 'It looks at the data points it got wrong and focuses purely on them. "I missed the Rockstar Junior? Okay, I\'ll build a specific rule just for them." It iteratively reduces error.',
        realExample: 'Like a teacher grading a test, then a second teacher grading the corrections, then a third teacher grading the remaining nuances. It gets incredibly precise.',
        visualPattern: 'Similar to a Forest (steps), but often fits the data points—including outliers—much tighter.',
        pros: ['Often the highest accuracy', 'State-of-the-art for tables', 'Handles mixed data types well'],
        cons: ['Can easily "overfit" (memorise noise)', 'Hard to tune', 'Sensitive to outliers (it tries to fix them)']
    },
    svm: {
        title: 'Support Vector Machine (SVM)',
        math: 'K(x, x\')',
        desc: 'Imagine trying to wrap a wide rubber band around your data points. SVM tries to find the "tube" that fits the most points comfortably.',
        when: 'When you have lots of different factors (dimensions) and need a robust curve.',
        howItWorks: 'It uses a "kernel trick" to project the data into higher dimensions to find the best fit. It cares more about the general flow than individual outliers.',
        realExample: 'It ignores the guy making £200k with 2 years experience (the outlier) to focus on where the majority of people sit.',
        visualPattern: 'A smooth, stiff curve. It feels "tighter" and often more conservative than the Polynomial.',
        pros: ['Great for high-dimensional data', 'Ignores extreme outliers', 'Very flexible'],
        cons: ['Painful to tune (gamma, epsilon, etc.)', 'Slow on big datasets', 'Math is scary']
    },
    knn: {
        title: 'k-Nearest Neighbors (k-NN)',
        math: 'avg(y₁, y₂, y₃)',
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
        math: 'f(W₂f(W₁x))',
        desc: 'The brain approach. It doesn\'t just treat inputs as separate numbers; it passes them through layers of "neurons" to find hidden connections. For example, it might learn that experience usually raises pay, but specific combinations—like "Senior" plus "AI" during a "Market Boom"—create a massive salary spike that a simple line graph would completely miss.',
        when: 'When you have massive data and the relationship is too complex for simple math.',
        howItWorks: 'Data goes in, flows through layers of calculations, and salary comes out. It learns its own rules. It can spot things we miss, like "Salary dips at year 5 then spikes at year 7".',
        realExample: 'It\'s like an experienced recruiter who just "knows" a salary based on a thousand tiny factors they can\'t even explain.',
        visualPattern: 'A smooth but wavy curve. It follows the trend but captures subtle oscillations and shifts that others miss.',
        pros: ['Unbeatable on complex tasks', 'Learns hidden features', 'Gets smarter with more data'],
        cons: ['Needs thousands of examples', 'Total black box', 'Can overthink it (overfit) if you aren\'t careful']
    }
};
