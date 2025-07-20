import Database from 'better-sqlite3';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export interface MealRecord {
  id: string;
  date: string;
  meal_type: string;
  food_items: string; // JSON string
  total_calories: number;
  timestamp: string;
}

export class CalorieDatabase {
  private db: Database.Database;
  
  constructor() {
    // Create data directory in user's home folder
    const dataDir = path.join(os.homedir(), '.daily-calorie-tracker');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const dbPath = path.join(dataDir, 'calories.db');
    this.db = new Database(dbPath);
    
    // Initialize tables
    this.initializeTables();
  }
  
  private initializeTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS meals (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        food_items TEXT NOT NULL,
        total_calories INTEGER NOT NULL,
        timestamp TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
      CREATE INDEX IF NOT EXISTS idx_meals_timestamp ON meals(timestamp);
    `);
  }
  
  addMeal(meal: MealRecord): void {
    const stmt = this.db.prepare(`
      INSERT INTO meals (id, date, meal_type, food_items, total_calories, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      meal.id,
      meal.date,
      meal.meal_type,
      meal.food_items,
      meal.total_calories,
      meal.timestamp
    );
  }
  
  getMealsByDate(date: string): MealRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM meals WHERE date = ? ORDER BY timestamp
    `);
    
    return stmt.all(date) as MealRecord[];
  }
  
  getMealsByDateRange(startDate: string, endDate: string): MealRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM meals 
      WHERE date >= ? AND date <= ? 
      ORDER BY date, timestamp
    `);
    
    return stmt.all(startDate, endDate) as MealRecord[];
  }
  
  getMealById(id: string): MealRecord | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM meals WHERE id = ?
    `);
    
    return stmt.get(id) as MealRecord | undefined;
  }
  
  updateMeal(id: string, meal: Partial<MealRecord>): void {
    const updates: string[] = [];
    const values: any[] = [];
    
    if (meal.food_items !== undefined) {
      updates.push('food_items = ?');
      values.push(meal.food_items);
    }
    
    if (meal.total_calories !== undefined) {
      updates.push('total_calories = ?');
      values.push(meal.total_calories);
    }
    
    if (updates.length === 0) return;
    
    values.push(id);
    
    const stmt = this.db.prepare(`
      UPDATE meals SET ${updates.join(', ')} WHERE id = ?
    `);
    
    stmt.run(...values);
  }
  
  deleteMeal(id: string): void {
    const stmt = this.db.prepare(`
      DELETE FROM meals WHERE id = ?
    `);
    
    stmt.run(id);
  }
  
  close(): void {
    this.db.close();
  }
}