
// A simplified conversion utility.
// In a real-world app, this would be much more comprehensive, potentially using a dedicated library.

const INGREDIENT_DENSITY: { [key: string]: number } = { // g/cup
    flour: 120,
    sugar: 200,
    'brown sugar': 220,
    butter: 227,
    water: 236,
    milk: 245,
    oil: 224,
};

const CONVERSIONS = {
    oz: 28.35, // g
    lb: 453.592, // g
    cup: 236.588, // ml
    tbsp: 14.787, // ml
    tsp: 4.929, // ml
};

const round = (value: number) => Math.round(value);

export const convertIngredient = (ingredient: string, system: 'us' | 'metric'): string => {
    if (system === 'us') return ingredient;

    const regex = /(\d*\.?\d+)\s*(oz|lb|cup|tbsp|tsp)s?/i;
    const match = ingredient.match(regex);
    
    if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        const restOfString = ingredient.replace(match[0], '').trim();

        switch (unit) {
            case 'oz':
            case 'lb':
                const grams = round(value * (unit === 'oz' ? CONVERSIONS.oz : CONVERSIONS.lb));
                return `${grams}g ${restOfString}`;
            case 'cup':
            case 'tbsp':
            case 'tsp':
                // Check for density-based conversion first for common baking items
                const ingredientName = Object.keys(INGREDIENT_DENSITY).find(key => restOfString.toLowerCase().includes(key));
                if (unit === 'cup' && ingredientName) {
                    const densityGrams = round(value * INGREDIENT_DENSITY[ingredientName]);
                    return `${densityGrams}g ${restOfString}`;
                }
                // Fallback to simple volume conversion
                const ml = round(value * CONVERSIONS[unit as keyof typeof CONVERSIONS]);
                return `${ml}ml ${restOfString}`;
        }
    }
    return ingredient;
};

export const convertInstruction = (instruction: string, tempUnit: 'f' | 'c'): string => {
    if (tempUnit === 'f') return instruction;
    
    return instruction.replace(/(\d+)\s*°?F\b/g, (match, tempF) => {
        const tempC = Math.round(((parseInt(tempF, 10) - 32) * 5) / 9 / 5) * 5; // Round to nearest 5
        return `${tempC}°C`;
    }).replace(/(\d+)\s*degrees F/ig, (match, tempF) => {
        const tempC = Math.round(((parseInt(tempF, 10) - 32) * 5) / 9 / 5) * 5; // Round to nearest 5
        return `${tempC}°C`;
    });
};
