# ClauseCodeAI - Deployment Success ✅

## Deployment Details

**Project:** `teachmemedical-prod`  
**Service Name:** `clausecodeai`  
**Region:** `us-central1`  
**Repository:** `tmm-apps` (Artifact Registry)  
**Service URL:** https://clausecodeai-fkppyww5qa-uc.a.run.app

## Deployment Configuration

- **Container Registry:** Artifact Registry (us-central1-docker.pkg.dev)
- **Image:** `us-central1-docker.pkg.dev/teachmemedical-prod/tmm-apps/clausecodeai:latest`
- **Memory:** 512Mi
- **Timeout:** 300 seconds
- **Port:** 8080
- **Authentication:** Unauthenticated (public access)

## Secrets Configuration

The following secrets are automatically loaded from Google Cloud Secrets Manager:

- ✅ `OPENAI_API_KEY` - Configured and mounted
- ⚠️ `SERPAPI_KEY` - Not configured (optional)

## Testing

Service is live and responding:

```bash
curl https://clausecodeai-fkppyww5qa-uc.a.run.app/health
# Response: {"status":"ok","message":"Server is running"}
```

## Available Endpoints

- `GET /` - Home page / API info
- `GET /health` - Health check
- `POST /analyze` - AI analysis of page content
- `POST /upload` - Upload PDF/Word documents
- `POST /scrape-url` - Scrape content from URL
- `POST /search-alternatives` - Search for service alternatives (requires SERPAPI_KEY)
- `POST /save` - Save analysis data

## Chrome Extension Configuration

Update your Chrome extension (`popup.js`) with the service URL:

```javascript
const SERVER_URL = 'https://clausecodeai-fkppyww5qa-uc.a.run.app';
```

Then reload the extension in Chrome.

## Monitoring & Logs

View real-time logs:
```bash
gcloud run services logs read clausecodeai \
  --region us-central1 \
  --project teachmemedical-prod \
  --limit 100
```

View in Cloud Console:
```
https://console.cloud.google.com/run/detail/us-central1/clausecodeai/metrics?project=teachmemedical-prod
```

## Redeployment

To deploy updates:

```bash
cd /Users/paul/Dev/gwc
./deploy.sh
```

This will:
1. Build new container image
2. Push to Artifact Registry
3. Deploy new revision to Cloud Run
4. Route 100% traffic to new revision

## Cost Estimate

**Cloud Run:**
- Free tier: 2M requests/month
- Estimated cost: $1-5/month for typical usage

**Artifact Registry:**
- Storage: $0.10/GB/month
- Estimated: <$1/month

**Secrets Manager:**
- $0.06 per secret version per month
- Estimated: $0.06/month

**Total estimated cost: $1-6/month**

## Architecture

```
Chrome Extension
    ↓
    ↓ HTTPS POST
    ↓
Cloud Run (clausecodeai)
    ↓
    ├─→ Google Secrets Manager (API keys)
    ├─→ OpenAI API (gpt-4o-mini)
    └─→ SerpAPI (optional)
```

## Security

✅ API keys stored in Google Secrets Manager  
✅ HTTPS enforced by Cloud Run  
✅ Container runs with minimal permissions  
✅ Service account has secretAccessor role only  
✅ No sensitive data in code or environment variables  

## Next Steps

1. ✅ Deploy to Cloud Run - **COMPLETE**
2. ⬜ Update Chrome extension with service URL
3. ⬜ Test all endpoints with Chrome extension
4. ⬜ (Optional) Add SERPAPI_KEY secret for search alternatives feature
5. ⬜ (Optional) Set up Cloud Build triggers for CI/CD
6. ⬜ (Optional) Configure custom domain

## Troubleshooting

### Service not responding
```bash
# Check service status
gcloud run services describe clausecodeai \
  --region us-central1 \
  --project teachmemedical-prod

# Check recent logs
gcloud run services logs read clausecodeai \
  --region us-central1 \
  --project teachmemedical-prod \
  --limit 50
```

### API key issues
```bash
# Verify secret exists
gcloud secrets describe OPENAI_API_KEY --project teachmemedical-prod

# Check IAM permissions
gcloud secrets get-iam-policy OPENAI_API_KEY --project teachmemedical-prod
```

### Redeploy specific revision
```bash
# List revisions
gcloud run revisions list \
  --service clausecodeai \
  --region us-central1 \
  --project teachmemedical-prod

# Route traffic to specific revision
gcloud run services update-traffic clausecodeai \
  --to-revisions REVISION_NAME=100 \
  --region us-central1 \
  --project teachmemedical-prod
```

## Support

- Cloud Run Documentation: https://cloud.google.com/run/docs
- Artifact Registry: https://cloud.google.com/artifact-registry/docs
- Secret Manager: https://cloud.google.com/secret-manager/docs
