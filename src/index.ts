#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { parseMealDescription, searchFood } from './meal-parser.js';
import { CalorieDatabase, MealRecord } from './database.js';

interface Meal {
  id: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  foodItems: Array<{ name: string; calories: number; quantity: number }>;
  totalCalories: number;
  timestamp: string;
}

const server = new Server(
  {
    name: "daily-calorie-tracker",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const db = new CalorieDatabase();

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  db.close();
  process.exit(0);
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "add_meal",
        description: "Log a meal with food items and calories",
        inputSchema: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "Natural language description of the meal (e.g., 'chicken salad and a glass of milk')"
            },
            mealType: {
              type: "string",
              enum: ["breakfast", "lunch", "dinner", "snack"],
              description: "Type of meal"
            }
          },
          required: ["description", "mealType"]
        }
      },
      {
        name: "get_daily_summary",
        description: "Get today's calorie intake summary",
        inputSchema: {
          type: "object",
          properties: {
            date: {
              type: "string",
              description: "Date in YYYY-MM-DD format (defaults to today)"
            }
          }
        }
      },
      {
        name: "get_weekly_report",
        description: "Get weekly calorie consumption report",
        inputSchema: {
          type: "object",
          properties: {
            startDate: {
              type: "string",
              description: "Start date in YYYY-MM-DD format (defaults to 7 days ago)"
            }
          }
        }
      },
      {
        name: "search_food",
        description: "Search for calorie information of a specific food",
        inputSchema: {
          type: "object",
          properties: {
            foodName: {
              type: "string",
              description: "Name of the food to search"
            }
          },
          required: ["foodName"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "add_meal": {
      const { description, mealType } = request.params.arguments as any;
      
      const foodItems = parseMealDescription(description);
      const totalCalories = foodItems.reduce((sum, item) => sum + item.calories, 0);
      
      const meal: Meal = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        mealType,
        foodItems,
        totalCalories,
        timestamp: new Date().toISOString()
      };
      
      // Store in database
      const mealRecord: MealRecord = {
        id: meal.id,
        date: meal.date,
        meal_type: meal.mealType,
        food_items: JSON.stringify(meal.foodItems),
        total_calories: meal.totalCalories,
        timestamp: meal.timestamp
      };
      
      db.addMeal(mealRecord);
      
      let foodItemsText = foodItems.length > 0 
        ? foodItems.map(item => `  - ${item.name}: ${item.calories} calories (x${item.quantity})`).join('\n')
        : '  No recognized foods found. Try using more specific food names.';
      
      return {
        content: [
          {
            type: "text",
            text: `Meal logged successfully!\n\nMeal Type: ${mealType}\nFood Items:\n${foodItemsText}\n\nTotal Calories: ${totalCalories}`
          }
        ]
      };
    }
    
    case "get_daily_summary": {
      const { date } = request.params.arguments as any;
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const mealRecords = db.getMealsByDate(targetDate);
      const dailyMeals = mealRecords.map(record => ({
        id: record.id,
        date: record.date,
        mealType: record.meal_type as "breakfast" | "lunch" | "dinner" | "snack",
        foodItems: JSON.parse(record.food_items),
        totalCalories: record.total_calories,
        timestamp: record.timestamp
      }));
      const totalCalories = dailyMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
      
      const mealBreakdown = dailyMeals.map(meal => {
        const foodList = meal.foodItems.map((item: any) => `    - ${item.name}: ${item.calories} cal`).join('\n');
        return `  ${meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)} (${meal.totalCalories} cal):\n${foodList}`;
      }).join('\n\n');
      
      return {
        content: [
          {
            type: "text",
            text: `Daily Summary for ${targetDate}:\n\nTotal Meals: ${dailyMeals.length}\nTotal Calories: ${totalCalories}\n\nMeals:\n${mealBreakdown || '  No meals logged today'}`
          }
        ]
      };
    }
    
    case "get_weekly_report": {
      const { startDate } = request.params.arguments as any;
      
      // Calculate date range
      const endDate = new Date();
      const start = startDate 
        ? new Date(startDate) 
        : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Get meals within the date range
      const startDateStr = start.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      const mealRecords = db.getMealsByDateRange(startDateStr, endDateStr);
      
      const weeklyMeals = mealRecords.map(record => ({
        id: record.id,
        date: record.date,
        mealType: record.meal_type as "breakfast" | "lunch" | "dinner" | "snack",
        foodItems: JSON.parse(record.food_items),
        totalCalories: record.total_calories,
        timestamp: record.timestamp
      }));
      
      // Calculate statistics
      const dailyCalories: Record<string, number> = {};
      const mealTypeCount: Record<string, number> = {
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        snack: 0
      };
      
      weeklyMeals.forEach(meal => {
        dailyCalories[meal.date] = (dailyCalories[meal.date] || 0) + meal.totalCalories;
        mealTypeCount[meal.mealType]++;
      });
      
      const totalCalories = Object.values(dailyCalories).reduce((sum, cal) => sum + cal, 0);
      const daysWithMeals = Object.keys(dailyCalories).length;
      const avgDailyCalories = daysWithMeals > 0 ? Math.round(totalCalories / daysWithMeals) : 0;
      
      const dailyBreakdown = Object.entries(dailyCalories)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, calories]) => `  ${date}: ${calories} calories`)
        .join('\n');
      
      const highestDay = Object.entries(dailyCalories)
        .sort(([, a], [, b]) => b - a)[0];
      const lowestDay = Object.entries(dailyCalories)
        .sort(([, a], [, b]) => a - b)[0];
      
      return {
        content: [
          {
            type: "text",
            text: `Weekly Report (${start.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}):\n\n` +
              `Total Calories: ${totalCalories}\n` +
              `Average Daily Calories: ${avgDailyCalories}\n` +
              `Days Tracked: ${daysWithMeals}\n\n` +
              `Highest Day: ${highestDay ? `${highestDay[0]} (${highestDay[1]} cal)` : 'N/A'}\n` +
              `Lowest Day: ${lowestDay ? `${lowestDay[0]} (${lowestDay[1]} cal)` : 'N/A'}\n\n` +
              `Meal Distribution:\n` +
              `  Breakfast: ${mealTypeCount.breakfast}\n` +
              `  Lunch: ${mealTypeCount.lunch}\n` +
              `  Dinner: ${mealTypeCount.dinner}\n` +
              `  Snacks: ${mealTypeCount.snack}\n\n` +
              `Daily Breakdown:\n${dailyBreakdown || '  No meals logged this week'}`
          }
        ]
      };
    }
    
    case "search_food": {
      const { foodName } = request.params.arguments as any;
      const results = searchFood(foodName);
      
      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No foods found matching "${foodName}". Try a different search term.`
            }
          ]
        };
      }
      
      const resultText = results.map(({ name, info }) => 
        `  - ${name}: ${info.calories} calories per ${info.unit}`
      ).join('\n');
      
      return {
        content: [
          {
            type: "text",
            text: `Food search results for "${foodName}":\n\n${resultText}`
          }
        ]
      };
    }
    
    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Daily Calorie Tracker MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});