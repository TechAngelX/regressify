// src/data/classificationModels.js

export const generateClassificationData = () => {
  const data = [];
  for (let i = 0; i < 50; i++) {
    const experience = Math.random() * 15;
    const skillScore = Math.random() * 100;
    
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

export const classificationModels = {
  logistic: {
    name: 'Logistic Regression',
    icon: '📊',
    color: '#3b82f6',
    parameters: [
      { symbol: 'σ', name: 'Sigmoid Function', value: '1/(1+e⁻ˣ)', context: 'Squashes output to 0-1 probability' },
      { symbol: 'θ', name: 'Threshold', value: '0.5', context: 'Decision boundary for Yes/No' }
    ]
  },
  decisionTree: {
    name: 'Decision Tree',
    icon: '🌳',
    color: '#f59e0b',
    parameters: [
      { symbol: 'd', name: 'Max Depth', value: '4', context: 'How many questions to ask' },
      { symbol: 'g', name: 'Gini Impurity', value: '0.0', context: 'Measures "purity" of splits' }
    ]
  },
  randomForest: {
    name: 'Random Forest',
    icon: '🌲',
    color: '#059669',
    parameters: [
      { symbol: 'N', name: 'Trees', value: '100', context: 'Number of voters in the committee' },
      { symbol: 'v', name: 'Voting', value: 'Majority', context: 'Most votes wins' }
    ]
  },
  svm: {
    name: 'SVM Classifier',
    icon: '🎯',
    color: '#ec4899',
    parameters: [
      { symbol: 'C', name: 'Regularization', value: '1.0', context: 'Tolerance for misclassification' },
      { symbol: 'K', name: 'Kernel', value: 'RBF', context: 'Shape of decision boundary' }
    ]
  },
  knn: {
    name: 'k-NN Classifier',
    icon: '👥',
    color: '#ea580c',
    parameters: [
      { symbol: 'k', name: 'Neighbors', value: '5', context: 'How many neighbors vote' },
      { symbol: 'd', name: 'Distance', value: 'Euclidean', context: 'How we measure "closeness"' }
    ]
  },
  naiveBayes: {
    name: 'Naive Bayes',
    icon: '🧠',
    color: '#8b5cf6',
    parameters: [
      { symbol: 'P', name: 'Prior', value: 'P(Class)', context: 'Base rate of each class' },
      { symbol: 'L', name: 'Likelihood', value: 'P(X|Class)', context: 'Probability of features given class' }
    ]
  }
};

export const classificationDescriptions = {
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

export const calculateBoundary = (activeModel, exp) => {
  switch(activeModel) {
    case 'logistic':
      return (70 - exp * 5) / 0.8;
    case 'decisionTree':
      return exp < 5 ? 80 : exp < 10 ? 50 : 30;
    case 'randomForest':
      return 85 - exp * 4.5 + Math.sin(exp) * 5;
    case 'svm':
      return 90 - exp * 5 - 0.1 * exp * exp;
    case 'knn':
      return 80 - exp * 4 + (Math.random() - 0.5) * 10;
    case 'naiveBayes':
      return 75 - exp * 4;
    default:
      return 70 - exp * 4;
  }
};
