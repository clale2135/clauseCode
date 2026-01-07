# ClauseCode AI - Chrome Extension

A Chrome extension that analyzes Terms & Conditions pages using multiple AI personas (Regular, Lawyer, CEO, Bob, brainrot) and saves results to CSV.

## Features

- **Multiple AI Agents**: Different perspectives on T&C analysis
- **Analysis Types**: Malicious clauses, summaries, pros/cons, recommendations, alternatives
- **Local Data Storage**: CSV file saves to your local folder via Python backend server
- **Easy Setup**: Just run the server and use the extension

## Setup

### 1. Install Chrome Extension

1. Open `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this `chrome_extension` folder

### 2. Start Python Backend Server

```bash
cd chrome_extension
python3 -m venv venv
source venv/bin/activate
pip install flask
python3 server.py
```

Server runs on `http://localhost:5001`

### 3. Use the Extension

1. Click the extension icon on any webpage
2. Select a helper agent (Regular, Lawyer, CEO, Bob, brainrot)
3. Choose what you want to learn (malicious clauses, summary, pros/cons, etc.)
4. Click "Save Result To CSV (Local Server)" to save

Results append to `analysis_data.csv` in the `chrome_extension` folder.

## File Structure

```
chrome_extension/
├── manifest.json       # Extension configuration
├── popup.html          # UI for the popup
├── popup.js            # Extension logic
├── content.js          # Content script
├── server.py           # Flask backend for saving CSV
├── analysis_data.csv   # Generated data file (created after first save)
└── venv/               # Virtual environment (ignored in git)
```

## API Keys

The extension uses:
- **OpenAI API**: For analysis (uses gpt-4o-mini model)
- **SerpAPI**: For finding alternative services

Update `popup.js` with your own keys if needed.

## Server Endpoints

- `GET /` - Server status
- `GET /health` - Health check
- `POST /save` - Save analysis data (accepts JSON)

## Data Format

CSV columns: `Timestamp, Agent, Analysis Type, Page Title, Page URL, Result Text`

## Notes

- The Python server must be running for the "Save to CSV" feature to work
- Data is saved locally in the chrome_extension folder
- Virtual environment (`venv/`) is excluded from git
