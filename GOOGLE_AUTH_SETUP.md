# Google OAuth Setup Guide

## Overview
ClauseCode AI now supports Google Sign-In to associate saved analyses with user accounts.

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project `teachmemedical-prod` (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted:
   - User Type: **External**
   - App name: **ClauseCode AI**
   - User support email: Your email
   - Developer contact: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if needed

6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **ClauseCode AI Web Client**
   - Authorized JavaScript origins:
     - `http://localhost:5001` (for local development)
     - `https://clausecodeai-fkppyww5qa-uc.a.run.app` (your Cloud Run URL)
   - Authorized redirect URIs: (leave empty for now)
   
7. Copy the **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

### For Local Development

Create or update `.env` file:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Session secret (generate a random string)
SESSION_SECRET=your-random-secret-key-here
```

### For Cloud Run Deployment

Option 1: Save to Google Secret Manager (Recommended)

```bash
# Save Google Client ID
echo -n "your-client-id.apps.googleusercontent.com" | \
  gcloud secrets create GOOGLE_CLIENT_ID --data-file=- \
  --project=teachmemedical-prod

# Save Google Client Secret
echo -n "your-client-secret" | \
  gcloud secrets create GOOGLE_CLIENT_SECRET --data-file=- \
  --project=teachmemedical-prod

# Generate and save session secret
echo -n "$(openssl rand -base64 32)" | \
  gcloud secrets create SESSION_SECRET --data-file=- \
  --project=teachmemedical-prod
```

Then update `cloudbuild.yaml` to mount these secrets (already configured).

Option 2: Set as environment variables directly:

```bash
gcloud run services update clausecodeai \
  --region us-central1 \
  --project teachmemedical-prod \
  --set-env-vars "GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com" \
  --set-env-vars "SESSION_SECRET=your-random-secret"
```

## Step 3: Update HTML Files with Client ID

Edit these files and replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`:
- `index.html`
- `saved-analyses.html`

Update the meta tag:
```html
<meta name="google-client-id" content="YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com">
```

Or better, serve it dynamically from the backend (see Advanced Configuration below).

## Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

New dependencies added:
- `google-auth==2.47.0`
- `google-auth-oauthlib==1.2.1`
- `sanic-session==0.8.0`

## Step 5: Test Locally

```bash
python server.py
```

Visit `http://localhost:5001` and click "Sign in with Google"

## Features

### What's Implemented

✅ Google Sign-In button in header
✅ User profile photo and name display
✅ Secure session management
✅ Logout functionality
✅ Analyses automatically associated with logged-in users
✅ Filter saved analyses by user

### User Flow

1. User clicks "Sign in with Google"
2. Google OAuth popup appears
3. User selects Google account
4. Backend verifies token with Google
5. Session created with user info
6. User photo and name displayed in header
7. All saved analyses tagged with user_id
8. Users can only see their own analyses (when filtering is added)

## API Endpoints

### Authentication

**POST `/auth/google`** - Verify Google token and create session
```json
{
  "credential": "google_jwt_token"
}
```

**POST `/auth/logout`** - Logout and clear session

**GET `/auth/me`** - Get current user info
```json
{
  "status": "ok",
  "authenticated": true,
  "user": {
    "user_id": "google_user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://...",
    "email_verified": true
  }
}
```

## Advanced Configuration

### Serve Client ID from Backend

Instead of hardcoding Client ID in HTML, serve it from config:

In `server.py`, add endpoint:
```python
@app.route('/config/google-client-id', methods=['GET'])
async def get_google_client_id(request):
    return json_response({'client_id': config.GOOGLE_CLIENT_ID})
```

In `auth.js`, update:
```javascript
async function getGoogleClientId() {
    const response = await fetch('/config/google-client-id');
    const data = await response.json();
    return data.client_id;
}
```

### Production Security Checklist

- [ ] Use HTTPS in production (Cloud Run does this automatically)
- [ ] Set strong SESSION_SECRET (32+ random bytes)
- [ ] Store secrets in Google Secret Manager
- [ ] Add your production domain to Google OAuth authorized origins
- [ ] Enable email verification requirements
- [ ] Add rate limiting to auth endpoints
- [ ] Review OAuth consent screen settings
- [ ] Test with multiple browsers and devices

## Troubleshooting

### "Invalid token" error
- Verify GOOGLE_CLIENT_ID matches the one in HTML meta tag
- Check Google Cloud Console for correct authorized origins
- Ensure OAuth consent screen is published (not in testing mode)

### Session not persisting
- Check that cookies are enabled
- Verify SESSION_SECRET is set
- Check CORS settings allow credentials

### Login button doesn't appear
- Check browser console for JavaScript errors
- Verify `/static/auth.js` is loading correctly
- Check Google Sign-In library is loaded

## Next Steps

- Add user profile page
- Filter saved analyses by logged-in user
- Add user preferences/settings
- Email notifications for analysis completion
- Share analyses with other users
