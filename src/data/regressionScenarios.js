export const contextData = {
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

export const polyShapeData = Array.from({ length: 21 }, (_, i) => {
    const x = i;
    return {
        x,
        smile: 0.8 * Math.pow(x - 10, 2) + 20,
        frown: -0.8 * Math.pow(x - 10, 2) + 120,
        plateau: 100 * (1 - Math.exp(-0.4 * x)) + 10,
        jCurve: 0.5 * Math.pow(x, 2.2) + 5
    };
});

export const presetScenarios = {
    salary: { name: 'Salary Prediction', icon: '💰', label: 'Salary vs Experience', xLabel: 'Years of Experience', yLabel: 'Salary (£1000s)', xUnit: 'years', yUnit: ' k' },
    housePrices: { name: 'House Prices', icon: '🏠', label: 'House Price vs Size', xLabel: 'Square Metres', yLabel: 'Price (£1000s)', xUnit: 'm²', yUnit: ' k' },
    carMileage: { name: 'Car Value', icon: '🚗', label: 'Car Value vs Mileage', xLabel: 'Mileage (10k miles)', yLabel: 'Resale Value (£1000s)', xUnit: '10k mi', yUnit: ' k' },
    plantGrowth: { name: 'Plant Growth', icon: '🌱', label: 'Plant Height Over Time', xLabel: 'Weeks Since Planting', yLabel: 'Height (cm)', xUnit: 'weeks', yUnit: ' cm' },
    memeAdoption: { name: 'Meme Adoption', icon: '🐸', label: 'Virality over Time', xLabel: 'Hours Since Upload', yLabel: 'Shares (1000s)', xUnit: 'h', yUnit: 'k' },
    custom: { name: 'Custom', icon: '✏️', label: 'Custom Regression', xLabel: 'X Value', yLabel: 'Y Value', xUnit: '', yUnit: '' }
};
