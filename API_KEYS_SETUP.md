# API Keys Setup

For the extension to work, you need to add your API keys to localStorage. Add this to your browser console or create a setup page.

## Setup Instructions

1. Open the extension popup
2. Right-click → "Inspect" to open DevTools
3. Go to Console tab
4. Paste these commands with your actual keys:

```javascript
localStorage.setItem('OPENAI_API_KEY', 'sk-proj-YOUR_KEY_HERE');
localStorage.setItem('SERPAPI_KEY', 'YOUR_SERPAPI_KEY_HERE');
```

## Get Your Keys

- **OpenAI API Key**: https://platform.openai.com/api-keys
- **SerpAPI Key**: https://serpapi.com/manage/api-keys

Keys are stored locally in your browser and never uploaded to GitHub.
