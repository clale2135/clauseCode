# Deploying ClauseCode AI with Google OAuth to Cloud Run

## How Secrets Work on Cloud Run

### Local Development (Your Computer)
✅ Uses `.env` file
- Reads `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET` from `.env`
- `config.py` detects you're NOT on Cloud Run (no `K_SERVICE` env var)
- Skips Google Secret Manager

### Cloud Run Deployment
✅ Uses Google Secret Manager
- Cloud Run sets `K_SERVICE=cloudrun` environment variable
- `config.py` detects Cloud Run environment
- Fetches secrets from Google Secret Manager automatically
- Secrets are mounted as environment variables by Cloud Run

## Current Secret Manager Status

✅ **Already Saved:**
```bash
gcloud secrets list --project=teachmemedical-prod
```

You should see:
- `GOOGLE_CLIENT_ID` ✅
- `GOOGLE_CLIENT_SECRET` ✅
- `SESSION_SECRET` ✅
- `OPENAI_API_KEY` ✅

## Deployment Configuration

### Updated `cloudbuild.yaml`
The deployment now includes all OAuth secrets:

```yaml
--update-secrets
OPENAI_API_KEY=OPENAI_API_KEY:latest,
GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID:latest,
GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest,
SESSION_SECRET=SESSION_SECRET:latest
```

### How It Works

1. **Cloud Build** builds your Docker container
2. **Cloud Run** deploys the container
3. **Secret Manager** secrets are mounted as environment variables
4. **Your app** reads them via `os.getenv()` in `config.py`

## Deploy Now

```bash
cd /Users/paul/Dev/gwc
./deploy.sh
```

This will:
1. Build the Docker image
2. Push to Artifact Registry
3. Deploy to Cloud Run with all secrets
4. Return your service URL

## Important: Update OAuth Authorized Origins

After deployment, add your Cloud Run URL to Google OAuth:

1. Go to: https://console.cloud.google.com/apis/credentials?project=teachmemedical-prod
2. Click on OAuth Client ID: `761223278824-ijp6lq944kp1lapmcgubvh8pq65r67t3`
3. Add to **Authorized JavaScript origins**:
   - `https://clausecodeai-fkppyww5qa-uc.a.run.app`
   - (or whatever your Cloud Run URL is)

## Verify Secrets Are Accessible

After deployment, check the logs:

```bash
gcloud run services logs read clausecodeai \
  --region us-central1 \
  --project teachmemedical-prod \
  --limit 50
```

You should see:
```
✅ Firestore initialized successfully
🔑 OpenAI API Key configured: Yes
```

## Testing on Cloud Run

1. Visit your Cloud Run URL: `https://clausecodeai-fkppyww5qa-uc.a.run.app`
2. Click "Sign in with Google"
3. Authenticate
4. Your name/photo should appear!

## Troubleshooting

### "Invalid token" error
- Check that the Client ID in HTML matches the one in Secret Manager
- Verify authorized origins include your Cloud Run URL

### Secrets not loading
```bash
# Check if secrets exist
gcloud secrets list --project=teachmemedical-prod

# Check secret value (first 20 chars)
gcloud secrets versions access latest --secret=GOOGLE_CLIENT_ID --project=teachmemedical-prod | head -c 20

# Grant Cloud Run service account access to secrets
gcloud secrets add-iam-policy-binding GOOGLE_CLIENT_ID \
  --member="serviceAccount:761223278824-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=teachmemedical-prod
```

### Session issues
- Session secret is automatically generated and saved
- Sessions are in-memory (will reset on container restart)
- For production, consider Redis or Firestore sessions

## Security Notes

✅ Secrets never in code or Docker image
✅ Secrets only accessible to Cloud Run service account
✅ HTTPS enforced by Cloud Run
✅ Session cookies are httpOnly and secure

## Ready to Deploy!

```bash
./deploy.sh
```

🚀 Your app will be live with Google OAuth in ~3-5 minutes!
