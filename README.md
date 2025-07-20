# Daily Calorie Tracker MCP Server

A Model Context Protocol (MCP) server for tracking daily calorie consumption through natural language interactions.

## Features

- **Natural Language Meal Entry**: Log meals using descriptions like "chicken salad and a glass of milk"
- **Daily Summaries**: Get total calorie intake with meal breakdowns
- **Weekly Reports**: View average consumption, trends, and achievement tracking
- **Food Search**: Look up calorie information for specific foods
- **Persistent Storage**: SQLite database for cross-session data retention

## Installation

### Via npm (Recommended)

```bash
npm install -g daily-calorie-tracker-mcp
```

### From Source

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## MCP Server Configuration

### For Claude Desktop

Add to your Claude Desktop configuration file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### NPM Installation Configuration:
```json
{
  "mcpServers": {
    "daily-calorie-tracker": {
      "command": "npx",
      "args": ["-y", "daily-calorie-tracker-mcp"]
    }
  }
}
```

#### Local Installation Configuration:
```json
{
  "mcpServers": {
    "daily-calorie-tracker": {
      "command": "node",
      "args": ["/path/to/daily-calorie-tracker/dist/index.js"]
    }
  }
}
```

### For Cursor

Add to your Cursor settings (`~/.cursor/settings.json`):

```json
{
  "mcpServers": {
    "daily-calorie-tracker": {
      "command": "npx",
      "args": ["-y", "daily-calorie-tracker-mcp"]
    }
  }
}
```

### For Continue.dev

Add to your Continue configuration (`~/.continue/config.json`):

```json
{
  "models": [
    {
      "model": "claude-3-5-sonnet-latest",
      "provider": "anthropic",
      "mcpServers": [
        {
          "name": "daily-calorie-tracker",
          "command": "npx",
          "args": ["-y", "daily-calorie-tracker-mcp"]
        }
      ]
    }
  ]
}
```

## Available MCP Tools

The server provides the following tools:

### `add_meal`
Log a meal with natural language description.

**Parameters:**
- `description` (string, required): Natural language description of the meal (e.g., "chicken salad and a glass of milk")
- `mealType` (string, required): Type of meal - "breakfast", "lunch", "dinner", or "snack"

**Example:**
```
Add breakfast: oatmeal with banana and coffee
```

### `get_daily_summary`
Get today's calorie intake summary with meal breakdown.

**Parameters:**
- `date` (string, optional): Date in YYYY-MM-DD format (defaults to today)

**Example:**
```
Show today's calorie summary
```

### `get_weekly_report`
Generate a weekly calorie consumption report with statistics.

**Parameters:**
- `startDate` (string, optional): Start date in YYYY-MM-DD format (defaults to 7 days ago)

**Example:**
```
Generate weekly report
```

### `search_food`
Search for calorie information of specific foods.

**Parameters:**
- `foodName` (string, required): Name of the food to search

**Example:**
```
Search calories for pizza
```

## Usage Examples

Once configured, you can use natural language to track your calories:

- "Log breakfast: oatmeal with banana and coffee"
- "Add lunch: grilled chicken salad and apple juice"
- "Record dinner: pasta with tomato sauce and a glass of wine"
- "I had a snack: apple and yogurt"
- "Show today's calorie summary"
- "What did I eat today?"
- "Generate weekly report"
- "Show my calorie trends for this week"
- "Search calories for pizza"
- "How many calories in chicken breast?"

## Data Storage

Data is stored in SQLite database at:
- **MacOS/Linux**: `~/.daily-calorie-tracker/calories.db`
- **Windows**: `%USERPROFILE%\.daily-calorie-tracker\calories.db`

## Food Database

The server includes a comprehensive food database with 100+ common foods organized by categories:
- Proteins (chicken, beef, fish, eggs, tofu, etc.)
- Carbohydrates (rice, pasta, bread, potatoes, etc.)
- Vegetables (broccoli, spinach, tomatoes, etc.)
- Fruits (apples, bananas, berries, etc.)
- Beverages (milk, juice, coffee, tea, etc.)
- Dairy products (cheese, yogurt, butter, etc.)
- Common meals (hamburger, pizza, sandwiches, etc.)
- Snacks (chips, nuts, chocolate, etc.)

## Development

- `npm run dev` - Run in development mode
- `npm run build` - Build for production
- `npm start` - Run production build

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Repository

GitHub: https://github.com/VeriTeknik/daily-calorie-tracker