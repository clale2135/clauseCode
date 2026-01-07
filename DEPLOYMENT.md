# Deploy to Railway

**Easy steps to deploy the Python backend to Railway:**

## 1. Sign up at Railway
Go to https://railway.app and sign up with GitHub

## 2. Create a new project
- Click "Create New Project"
- Select "Deploy from GitHub"
- Choose this repo (`clale2135/gwc`)

## 3. Set Environment Variables
In Railway dashboard:
- Go to Variables
- Add these environment variables:
  ```
  OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
  SERPAPI_KEY=YOUR_SERPAPI_KEY_HERE
  ```

## 4. Railway will auto-deploy
Once you push to GitHub, Railway auto-deploys. Wait 2-3 minutes.

## 5. Get your server URL
In Railway dashboard:
- Click on the deployment
- Find "Public URL" (looks like `https://your-app-xyz.railway.app`)

## 6. Update Chrome Extension
In `popup.js`, change:
```javascript
const SERVER_URL = 'https://your-app-xyz.railway.app';
```

Then reload the extension and it'll use your hosted backend!

## Cost
- First $5/month is free
- After that ~$5 for small app
- But it includes database space too

## Notes
- Your API keys are safe on Railway servers (not in GitHub)
- CSV data saves to Railway's file system
- You can view logs in Railway dashboard
