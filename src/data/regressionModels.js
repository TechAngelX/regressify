// src/data/regressionModels.js

const OUTLIER_TEMPLATES = {
    massivePositive: {
        offset: [50, 70],
        labels: {
            salary: "MASSIVE OUTLIER: The 'Unicorn' Hire. 22yo Genius recruited by Big Tech. Salary detached from reality.",
            plantGrowth: "MUTATION: Genetic anomaly combined with perfect hydroponic conditions. Growth exploded.",
            housePrices: "MARKET MADNESS: Bidding war on a 'trophy' property. Sold for double the street average.",
            carMileage: "COLLECTOR GRADE: 1-of-100 limited edition, never driven. Value skyrocketing.",
            custom: "EXTREME HIGH: Rare black swan event caused a massive positive spike."
        }
    },
    moderatePositive: {
        offset: [20, 35],
        labels: {
            salary: "Top Performer: Consistently exceeds targets. Paid at the 90th percentile.",
            plantGrowth: "Ideal Conditions: positioned in the sunniest spot of the greenhouse.",
            housePrices: "Premium Finish: High-spec renovation added significant value.",
            carMileage: "Low Mileage: Grandma's car, driven only to the shops on Sundays.",
            custom: "Above Average: Favourable conditions boosted the result."
        }
    },
    massiveNegative: {
        offset: [-50, -70],
        labels: {
            salary: "CRITICAL FAIL: Role became obsolete. Demoted and pay frozen for a decade.",
            plantGrowth: "CATASTROPHE: Accidental herbicide exposure halted growth completely.",
            housePrices: "CONDEMNED: Structural collapse found. Value effectively land-only.",
            carMileage: "WRITE-OFF: Category S structural damage. Value plummeted.",
            custom: "EXTREME LOW: System failure caused a massive drop."
        }
    },
    moderateNegative: {
        offset: [-20, -35],
        labels: {
            salary: "Underpaid: Stayed loyal to a struggling company too long.",
            plantGrowth: "Poor Soil: Nutrient deficiency slowed development.",
            housePrices: "Needs Work: Dated interior and single glazing reduced the price.",
            carMileage: "High Mileage: Ex-taxi or fleet vehicle. High wear and tear.",
            custom: "Below Average: Limiting factors suppressed the result."
        }
    }
};

// HELPER: Dynamic Context Text for Parameters
const getScenarioContext = (scenario, param, value) => {
    const contexts = {
        salary: {
            w: `This controls how fast salary grows with experience. A weight of ${value} means that, on average, each additional year of experience adds £${value}k to the predicted salary. If this value were larger, the line would rise more steeply.`,
            b: `This is the model’s starting point. It defines the predicted salary when experience is zero — in other words, the baseline pay before any years of work are counted. Here, the model assumes a new entrant starts around £${value}k, and everything else builds upward from that foundation.`
        },
        plantGrowth: {
            w: `This controls the rate of growth. A weight of ${value} means the plant grows ${value}cm per week on average. It represents the vigour of the plant's development over time.`,
            b: `This is the model’s starting point. It defines the seedling's height when first planted (Week 0). Here, the model assumes a starting height of ${value}cm, and growth builds upward from there.`
        },
        housePrices: {
            w: `This controls how price relates to size. A weight of ${value} means every extra square metre adds £${value}k to the property value. It represents the premium paid for space.`,
            b: `This is the model’s starting point. It represents the base land value before any floor space is accounted for. Here, the model assumes a base land value of £${value}k.`
        },
        carMileage: {
            w: `This controls how value changes with mileage. A weight of ${value} implies the value shifts by £${value}k for every 10k miles driven.`,
            b: `This is the model’s starting point. It defines the predicted resale value for a car with zero miles (brand new). Here, it assumes a showroom value of £${value}k.`
        },
        custom: {
            w: `This controls how fast the Y Value changes with X. A slope of ${value} means Y increases by ${value} units for every 1 unit of X.`,
            b: `This is the model’s starting point. It defines the Y Value when X is zero (the intercept). Here, the model starts at ${value}.`
        }
    };

    const s = contexts[scenario] || contexts.custom;
    return s[param];
};

// 1. DATA GENERATION
export const generateData = () => {
    const data = [];

    // 1. Pick 4 unique random years (between 1 and 19 to avoid edges)
    const availableYears = Array.from({length: 19}, (_, i) => i + 1);
    availableYears.sort(() => Math.random() - 0.5);
    const selectedYears = availableYears.slice(0, 4);

    // 2. Prepare the 4 outlier types
    const types = ['massivePositive', 'moderatePositive', 'massiveNegative', 'moderateNegative'];
    types.sort(() => Math.random() - 0.5);

    // 3. Map Years to Types
    const outlierMap = {};
    selectedYears.forEach((year, index) => {
        outlierMap[year] = types[index];
    });

    for (let experience = 0; experience <= 20; experience++) {
        // Base pattern: generic quadratic curve
        const baseValue = 45 + 15 * experience - 0.3 * experience * experience;

        // Real world noise
        let realWorldVariation = (Math.random() - 0.5) * 20;
        let label = null;
        let isOutlier = false;

        // Check if this year was chosen as an outlier
        if (outlierMap[experience]) {
            const type = outlierMap[experience];
            const template = OUTLIER_TEMPLATES[type];

            // Calculate random offset within range
            const min = template.offset[0];
            const max = template.offset[1];
            const offset = min < max
                ? min + Math.random() * (max - min)
                : min + Math.random() * (min - max);

            realWorldVariation += offset;
            isOutlier = true;
            label = template.labels;
        }

        const actual = baseValue + realWorldVariation;

        data.push({
            experience,
            actual: Math.max(actual, 20), // Floor value
            label,
            isOutlier
        });
    }
    return data;
};

// 2. MODEL CALCULATIONS
export const calculateModelFits = (rawData, activeScenario = 'salary') => {

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
        const avgVal = neighbors.reduce((sum, n) => sum + n.actual, 0) / k;
        return { ...targetPoint, predicted: avgVal };
    });

    // Neural Network
    const neuralNetFit = rawData.map(d => ({
        ...d,
        predicted: 45 + 15 * d.experience - 0.3 * d.experience * d.experience +
            3 * Math.sin(d.experience * 0.4)
    }));

    return {
        linear: {
            data: linearFit,
            name: 'Linear Regression',
            icon: '📏',
            color: '#3b82f6',
            parameters: [
                {
                    symbol: 'w',
                    name: 'Weight / Slope',
                    value: '5.0',
                    context: getScenarioContext(activeScenario, 'w', '5.0')
                },
                {
                    symbol: 'b',
                    name: 'Bias / Intercept',
                    value: '45.0',
                    context: getScenarioContext(activeScenario, 'b', '45.0')
                }
            ]
        },
        polynomial: {
            data: polynomialFit,
            name: 'Polynomial',
            icon: '📈',
            color: '#10b981',
            parameters: [
                { symbol: 'w₁', name: 'Linear Term', value: '15.0', context: 'Initial rapid growth' },
                { symbol: 'w₂', name: 'Squared Term', value: '-0.3', context: 'The "plateau" effect' },
                { symbol: 'b', name: 'Bias', value: '45.0', context: 'Starting value' }
            ]
        },
        tree: {
            data: decisionTreeFit,
            name: 'Decision Tree',
            icon: '🌳',
            color: '#f59e0b',
            parameters: [
                { symbol: 'd', name: 'Depth', value: '5', context: 'Max "questions" asked' },
                { symbol: 'n', name: 'Leaves', value: '5', context: 'Distinct value bands' }
            ]
        },
        forest: {
            data: randomForestFit,
            name: 'Random Forest',
            icon: '🌲',
            color: '#059669',
            parameters: [
                { symbol: 'N', name: 'Trees', value: '3', context: 'Number of experts' },
                { symbol: 'μ', name: 'Aggregation', value: 'Mean', context: 'Averaging predictions' }
            ]
        },
        boosting: {
            data: boostingFit,
            name: 'Gradient Boosting',
            icon: '🚀',
            color: '#be123c',
            parameters: [
                { symbol: 'η', name: 'Learning Rate', value: '0.1', context: 'Correction step size' },
                { symbol: 'i', name: 'Iterations', value: '3', context: 'Correction rounds' }
            ]
        },
        svm: {
            data: svmFit,
            name: 'SVM',
            icon: '🎯',
            color: '#ec4899',
            parameters: [
                { symbol: 'K', name: 'Kernel', value: 'RBF', context: 'Curved boundary' },
                { symbol: 'ε', name: 'Epsilon', value: '0.1', context: 'Allowed error margin' }
            ]
        },
        knn: {
            data: knnFit,
            name: 'k-NN (k=3)',
            icon: '👥',
            color: '#ea580c',
            parameters: [
                { symbol: 'k', name: 'Neighbors', value: '3', context: 'Similar points used' },
                { symbol: 'd', name: 'Distance', value: 'Euclidean', context: 'Similarity metric' }
            ]
        },
        neural: {
            data: neuralNetFit,
            name: 'Neural Network',
            icon: '🧠',
            color: '#8b5cf6',
            parameters: [
                { symbol: 'h', name: 'Hidden Layers', value: '2', context: 'Depth of reasoning' },
                { symbol: 'σ', name: 'Activation', value: 'ReLU', context: 'Non-linear thinking' }
            ]
        }
    };
};

// 3. TEXT CONTENT
export const descriptions = {
    linear: {
        title: 'Linear Regression',
        math: 'y = wx + b',
        desc: 'The simplest approach. It assumes a straight line relationship: a constant increase for every unit of X. It ignores the fact that growth usually slows down or accelerates.',
        when: 'Great for simple trends, but life is rarely a straight line.',
        howItWorks: 'It draws a straight line (y = mx + b) right through the middle of the mess. It looks at the scattered dots and finds the average path.',
        realExample: 'Like saying "Every year adds exactly £5k to your worth." Simple, easy to explain, but often too simple for the real world.',
        visualPattern: 'A straight diagonal line. The dots are scattered all around it, showing the "noise" of real life.',
        pros: ['Super easy to explain', 'Calculates instantly', 'Hard to break (doesn\'t overfit)', 'Great baseline to start with'],
        cons: ['Misses curves (like career plateaus)', 'Too rigid for complex data', 'Oversimplifies reality']
    },
    polynomial: {
        title: 'Polynomial Regression',
        math: 'y = w₁x + w₂x² + b',
        desc: 'Now we\'re adding curves. This model understands that things can grow fast in the beginning but eventually hit a ceiling (plateau).',
        when: 'When the trend clearly isn\'t straight (e.g. rapid growth then slowing down).',
        howItWorks: 'Instead of just x, we use x² or x³. This lets the line bend. It fits the "inverted U" shape often found in nature and economics.',
        realExample: 'Junior staff get big raises fast; senior staff get smaller percentage raises. Plants grow fast then stop.',
        visualPattern: 'A smooth curve that climbs steep and then flattens out. It follows the "shape" of the data better.',
        pros: ['Fits curved patterns nicely', 'Still fairly easy to interpret', 'Matches natural growth cycles'],
        cons: ['Can go wild at the edges (extrapolation)', 'If you add too many curves, it gets messy', 'Harder to explain the math']
    },
    tree: {
        title: 'Decision Tree Regression',
        math: 'if x < a then y = b',
        desc: 'Think of this like a flowchart. It creates strict value bands based on brackets of X.',
        when: 'When you need clear-cut rules that humans can easily follow.',
        howItWorks: 'It asks questions: "Less than 2? Value is 50. Less than 5? Value is 75." It doesn\'t care about the specific number, just which bucket you fall into.',
        realExample: 'Like salary bands: "3-5 years experience: £75k-£85k." It groups everyone in that range together.',
        visualPattern: 'Steps or stairs. Flat lines that jump suddenly. It doesn\'t look natural, but it\'s very logical.',
        pros: ['Crystal clear logic', 'Handles outliers well', 'Mimics human decision making', 'No complex math needed'],
        cons: ['Unrealistic jumps (4.9 vs 5.0)', 'Can be unstable', 'Misses the nuance of individual points']
    },
    forest: {
        title: 'Random Forest',
        math: 'Σ Tree_i / N',
        desc: 'This is just a team of Decision Trees working together. We ask 100 different trees to guess, then take the average. It smooths out the edges.',
        when: 'When accuracy matters more than having a simple formula.',
        howItWorks: 'One tree might obsess over early data, another over late data. By averaging them (the "ensemble"), we get rid of the biases.',
        realExample: 'Like asking 50 different experts for an estimate and taking the average. Fairer than asking just one person.',
        visualPattern: 'Jagged steps, but much smaller and smoother than a single Tree. It starts to look like a curve.',
        pros: ['Extremely accurate', 'Very robust (hard to fool)', 'Handles messy data brilliantly'],
        cons: ['Total "black box" (hard to see why it decided X)', 'Slow to train', 'Computer heavy']
    },
    boosting: {
        title: 'Gradient Boosting (e.g. XGBoost)',
        math: 'y = F(x) + h(x)',
        desc: 'The perfectionist. Instead of averaging random trees (like a Forest), it builds trees one by one, where each new tree tries to fix the mistakes of the previous one.',
        when: 'When you want to win a competition. It is the gold standard for tabular data.',
        howItWorks: 'It looks at the data points it got wrong and focuses purely on them. "I missed the outlier? Okay, I\'ll build a specific rule just for them."',
        realExample: 'Like a teacher grading a test, then a second teacher grading the corrections, then a third teacher grading the remaining nuances.',
        visualPattern: 'Similar to a Forest (steps), but often fits the data points—including outliers—much tighter.',
        pros: ['Often the highest accuracy', 'State-of-the-art for tables', 'Handles mixed data types well'],
        cons: ['Can easily "overfit" (memorise noise)', 'Hard to tune', 'Sensitive to outliers (it tries to fix them)']
    },
    svm: {
        title: 'Support Vector Machine (SVM)',
        math: 'K(x_i, x_j)',
        desc: 'Imagine trying to wrap a wide rubber band around your data points. SVM tries to find the "tube" that fits the most points comfortably.',
        when: 'When you have lots of different factors (dimensions) and need a robust curve.',
        howItWorks: 'It uses a "kernel trick" to project the data into higher dimensions to find the best fit. It cares more about the general flow than individual outliers.',
        realExample: 'It ignores the extreme outliers to focus on where the majority of points sit.',
        visualPattern: 'A smooth, stiff curve. It feels "tighter" and often more conservative than the Polynomial.',
        pros: ['Great for high-dimensional data', 'Ignores extreme outliers', 'Very flexible'],
        cons: ['Painful to tune (gamma, epsilon, etc.)', 'Slow on big datasets', 'Math is scary']
    },
    knn: {
        title: 'k-Nearest Neighbors (k-NN)',
        math: 'avg(y_near)',
        desc: 'The copycat method. "Show me the 3 points most similar to this one, and I\'ll guess based on them."',
        when: 'When local similarity matters more than a global trend.',
        howItWorks: 'If X is 7, it ignores X=2 and X=15. It finds the nearest existing points (e.g. 6.8, 7.0, 7.2) and averages their values.',
        realExample: 'Real estate: "This house is worth X because the 3 houses next door sold for X."',
        visualPattern: 'A wobbly, jagged line. It reacts to every local cluster of dots. If there\'s a random high point, the line bumps up right there.',
        pros: ['Zero training time', 'Very intuitive concept', 'Adapts to local changes instantly'],
        cons: ['Slow when you have to predict', 'Gets confused by useless data', 'Sensitive to noise']
    },
    neural: {
        title: 'Neural Network Regression',
        math: 'f(W_2 σ(W_1 x))',
        desc: 'The brain approach. It passes inputs through layers of "neurons" to find hidden connections and complex non-linear patterns.',
        when: 'When you have massive data and the relationship is too complex for simple math.',
        howItWorks: 'Data goes in, flows through layers of calculations, and a prediction comes out. It learns its own rules.',
        realExample: 'It\'s like an expert who just "knows" the answer based on a thousand tiny factors they can\'t even explain.',
        visualPattern: 'A smooth but wavy curve. It follows the trend but captures subtle oscillations and shifts that others miss.',
        pros: ['Unbeatable on complex tasks', 'Learns hidden features', 'Gets smarter with more data'],
        cons: ['Needs thousands of examples', 'Total black box', 'Can overthink it (overfit) if you aren\'t careful']
    }
};

// 4. HELPER FOR EDUCATIONAL CHARTS
export const generateFittingExamples = () => {
    const data = [];
    for (let x = 0; x <= 10; x++) {
        const signal = 50 + 20 * x - 1.5 * x * x;
        const noise = (Math.random() - 0.5) * 40;
        const actual = signal + noise;
        data.push({ x, actual, underfit: 60 + 5 * x, optimal: signal, overfit: actual });
    }
    return data;
};
