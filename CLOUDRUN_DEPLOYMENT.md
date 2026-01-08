# Cloud Run Deployment Guide for ClauseCodeAI

## Prerequisites

1. Google Cloud Project with billing enabled
2. gcloud CLI installed and configured
3. API keys stored in Google Cloud Secrets Manager

## Setup Google Cloud Secrets

Store your API keys in Google Secrets Manager:

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  containerregistry.googleapis.com

# Create secrets
echo -n "your-openai-api-key" | gcloud secrets create OPENAI_API_KEY \
  --data-file=- \
  --replication-policy="automatic"

echo -n "your-serpapi-key" | gcloud secrets create SERPAPI_KEY \
  --data-file=- \
  --replication-policy="automatic"

# Grant Cloud Run service account access to secrets
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud secrets add-iam-policy-binding OPENAI_API_KEY \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding SERPAPI_KEY \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"
```

## Deploy to Cloud Run

### Option 1: Using Cloud Build (Recommended)

```bash
# Submit build
gcloud builds submit --config cloudbuild.yaml
```

### Option 2: Manual Deployment

```bash
# Build and push container
gcloud builds submit --tag gcr.io/$PROJECT_ID/clausecodeai

# Deploy to Cloud Run
gcloud run deploy clausecodeai \
  --image gcr.io/$PROJECT_ID/clausecodeai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 300 \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID
```

### Option 3: Deploy with Secret Environment Variables

```bash
# Deploy with secrets mounted as environment variables
gcloud run deploy clausecodeai \
  --image gcr.io/$PROJECT_ID/clausecodeai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 300 \
  --update-secrets OPENAI_API_KEY=OPENAI_API_KEY:latest,SERPAPI_KEY=SERPAPI_KEY:latest
```

## Verify Deployment

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe clausecodeai \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)')

echo "Service URL: $SERVICE_URL"

# Test health endpoint
curl $SERVICE_URL/health
```

## Update Chrome Extension

Update the Chrome extension to point to your Cloud Run URL:

1. Open `popup.js`
2. Update `SERVER_URL` to your Cloud Run service URL
3. Reload the extension in Chrome

## Monitoring

View logs:
```bash
gcloud run services logs read clausecodeai --region us-central1
```

View metrics in Google Cloud Console:
- Navigate to Cloud Run
- Select your service
- View Metrics, Logs, and Revisions tabs

## Cost Optimization

Cloud Run pricing:
- Free tier: 2 million requests/month
- Charges for CPU/memory usage and requests beyond free tier
- Consider setting --min-instances=0 (default) for cost savings
- Adjust --memory based on actual usage

## Troubleshooting

### Secrets not loading
- Verify service account has secretAccessor role
- Check GOOGLE_CLOUD_PROJECT environment variable is set
- View logs for secret access errors

### Container fails to start
- Check Dockerfile builds locally: `docker build -t clausecodeai .`
- Verify PORT environment variable usage
- Check application logs in Cloud Console

### API errors
- Verify secrets contain correct API keys
- Test API keys locally first
- Check for rate limiting or billing issues

## Security Best Practices

1. **Never commit API keys** - Use Secrets Manager
2. **Use least privilege** - Grant minimal IAM roles
3. **Enable VPC if needed** - For private resources
4. **Set up monitoring** - Alert on unusual usage
5. **Rotate secrets** - Regularly update API keys

## Continuous Deployment

Set up Cloud Build triggers for automatic deployment:

```bash
# Create trigger for main branch
gcloud builds triggers create github \
  --repo-name=your-repo \
  --repo-owner=your-github-username \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```
