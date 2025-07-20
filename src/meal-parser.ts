import foodDatabase from './food-database.json';

interface FoodItem {
  name: string;
  calories: number;
  quantity: number;
}

interface FoodInfo {
  calories: number;
  unit: string;
}

const foodMap: Map<string, FoodInfo> = new Map();

// Build a flat map of all foods for easier searching
Object.values(foodDatabase.foods).forEach(category => {
  Object.entries(category).forEach(([name, info]) => {
    foodMap.set(name.toLowerCase(), info as FoodInfo);
  });
});

// Common quantity words and their multipliers
const quantityWords: Record<string, number> = {
  'a': 1,
  'an': 1,
  'one': 1,
  'two': 2,
  'three': 3,
  'four': 4,
  'five': 5,
  'half': 0.5,
  'quarter': 0.25,
  'double': 2,
  'triple': 3
};

// Common units and their conversions
const unitMultipliers: Record<string, number> = {
  'cup': 1,
  'cups': 1,
  'glass': 1,
  'glasses': 1,
  'slice': 1,
  'slices': 1,
  'piece': 1,
  'pieces': 1,
  'serving': 1,
  'servings': 1,
  'bowl': 1.5,
  'bowls': 1.5,
  'large': 1.5,
  'small': 0.75,
  'medium': 1
};

export function parseMealDescription(description: string): FoodItem[] {
  const normalizedDesc = description.toLowerCase();
  const words = normalizedDesc.split(/\s+/);
  const foodItems: FoodItem[] = [];
  
  // Try to find food items in the description
  for (const [foodName, foodInfo] of foodMap.entries()) {
    if (normalizedDesc.includes(foodName)) {
      let quantity = 1;
      
      // Look for quantity before the food name
      const foodIndex = normalizedDesc.indexOf(foodName);
      const beforeFood = normalizedDesc.substring(0, foodIndex).trim().split(/\s+/);
      
      if (beforeFood.length > 0) {
        const lastWord = beforeFood[beforeFood.length - 1];
        
        // Check if it's a number
        const num = parseFloat(lastWord);
        if (!isNaN(num)) {
          quantity = num;
        } else if (quantityWords[lastWord]) {
          quantity = quantityWords[lastWord];
        }
        
        // Check for unit multipliers
        if (beforeFood.length > 1) {
          const secondLastWord = beforeFood[beforeFood.length - 2];
          if (unitMultipliers[lastWord]) {
            quantity *= unitMultipliers[lastWord];
          } else if (unitMultipliers[secondLastWord]) {
            quantity *= unitMultipliers[secondLastWord];
          }
        }
      }
      
      foodItems.push({
        name: foodName,
        calories: Math.round(foodInfo.calories * quantity),
        quantity
      });
    }
  }
  
  // If no foods found, try partial matching
  if (foodItems.length === 0) {
    const tokens = normalizedDesc.split(/\s+/);
    
    for (const token of tokens) {
      for (const [foodName, foodInfo] of foodMap.entries()) {
        if (foodName.includes(token) || token.includes(foodName)) {
          foodItems.push({
            name: foodName,
            calories: foodInfo.calories,
            quantity: 1
          });
          break;
        }
      }
    }
  }
  
  return foodItems;
}

export function searchFood(query: string): Array<{ name: string; info: FoodInfo }> {
  const normalizedQuery = query.toLowerCase();
  const results: Array<{ name: string; info: FoodInfo }> = [];
  
  // Exact match first
  if (foodMap.has(normalizedQuery)) {
    results.push({ name: normalizedQuery, info: foodMap.get(normalizedQuery)! });
  }
  
  // Partial matches
  for (const [name, info] of foodMap.entries()) {
    if (name.includes(normalizedQuery) && name !== normalizedQuery) {
      results.push({ name, info });
    }
  }
  
  return results.slice(0, 10); // Return top 10 results
}