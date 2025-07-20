# Daily Calorie Tracker MCP Server

A Model Context Protocol (MCP) server for tracking daily calorie consumption through natural language interactions.

## Features

- **Natural Language Meal Entry**: Log meals using descriptions like "chicken salad and a glass of milk"
- **Daily Summaries**: Get total calorie intake with meal breakdowns
- **Weekly Reports**: View average consumption, trends, and achievement tracking
- **Food Search**: Look up calorie information for specific foods
- **Persistent Storage**: SQLite database for cross-session data retention

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Configuration

### For Claude Desktop

Add to your Claude Desktop configuration file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

### For Claude Code

Add to your settings:

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

## Usage

Once configured, you can use natural language to track your calories:

- "Log breakfast: oatmeal with banana and coffee"
- "Add lunch: grilled chicken salad and apple juice"
- "Show today's calorie summary"
- "Generate weekly report"
- "Search calories for pizza"

## Data Storage

Data is stored in SQLite database at:
- MacOS/Linux: `~/.daily-calorie-tracker/calories.db`
- Windows: `%USERPROFILE%\.daily-calorie-tracker\calories.db`

## Development

- `npm run dev` - Run in development mode
- `npm run build` - Build for production
- `npm start` - Run production build