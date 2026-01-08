# ClauseCodeAI - Cloud Run Quick Start

This project (formerly gwc) is now configured for deployment to Google Cloud Run under the name **clausecodeai**.

## 🚀 Quick Deploy (3 Steps)

### 1. Set Your GCP Project

```bash
gcloud config set project YOUR_PROJECT_ID
```

### 2. Setup Secrets (First Time Only)

```bash
./setup_secrets.sh
```

This will:
- Enable Secret Manager API
- Create secrets for OPENAI_API_KEY and SERPAPI_KEY
- Grant Cloud Run service account access to secrets

### 3. Deploy to Cloud Run

```bash
./deploy.sh
```

This will:
- Enable required GCP APIs (Cloud Run, Cloud Build, Container Registry)
- Build your Docker container
- Deploy to Cloud Run in us-central1
- Output your service URL

## ✅ Verify Deployment

After deployment, you'll receive a service URL like:
```
https://clausecodeai-xxxx-uc.a.run.app
```

Test it:
```bash
curl https://clausecodeai-xxxx-uc.a.run.app/health
```

## 📱 Update Chrome Extension

Update `popup.js` to point to your Cloud Run URL:

```javascript
const SERVER_URL = 'https://clausecodeai-xxxx-uc.a.run.app';
```

Then reload the Chrome extension.

## 🔧 Configuration

The application uses Google Cloud Secrets Manager to store API keys:
- `OPENAI_API_KEY` - Required for AI analysis
- `SERPAPI_KEY` - Optional for search alternatives feature

Environment variables (set in Cloud Run):
- `PORT` - Automatically set by Cloud Run (8080)
- `HOST` - Set to 0.0.0.0 in Dockerfile
- `GOOGLE_CLOUD_PROJECT` - Your GCP project ID

## 📊 Monitoring

View logs:
```bash
gcloud run services logs read clausecodeai --region us-central1 --limit 100
```

View metrics in Cloud Console:
```bash
open "https://console.cloud.google.com/run/detail/us-central1/clausecodeai/metrics"
```

## 🔄 Update Deployment

To deploy changes:

```bash
./deploy.sh
```

Cloud Build will automatically:
1. Build new container image
2. Push to Container Registry
3. Deploy new revision to Cloud Run
4. Route 100% traffic to new revision

## 💰 Cost Estimate

Cloud Run pricing (as of 2025):
- **Free tier**: 2M requests/month, 360K GB-seconds, 180K vCPU-seconds
- **Billing**: $0.00002400/request + $0.00001800/GB-second + $0.00002400/vCPU-second

For typical usage (1000 req/day, 100ms avg):
- Monthly cost: ~$1-5

Secrets Manager:
- $0.06 per active secret version per month
- ~$0.12/month for 2 secrets

**Total estimated cost: ~$1-6/month**

## 🛠️ Troubleshooting

### Deployment fails
```bash
# Check build logs
gcloud builds list --limit=5
gcloud builds log [BUILD_ID]
```

### Secrets not loading
```bash
# Verify secrets exist
gcloud secrets list

# Check IAM permissions
gcloud secrets get-iam-policy OPENAI_API_KEY
```

### Container won't start
```bash
# Test Docker build locally
docker build -t clausecodeai .
docker run -p 8080:8080 -e OPENAI_API_KEY=your-key clausecodeai

# Check Cloud Run logs
gcloud run services logs read clausecodeai --region us-central1
```

## 📚 Additional Resources

- [CLOUDRUN_DEPLOYMENT.md](./CLOUDRUN_DEPLOYMENT.md) - Detailed deployment guide
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)

## 🔐 Security Best Practices

✅ API keys stored in Secret Manager (not in code)  
✅ Service runs with default compute service account  
✅ Secrets accessed via IAM permissions  
✅ Container runs as non-root user  
✅ HTTPS enforced by Cloud Run  

## 📝 Project Structure

```
gwc/
├── server.py              # Main Sanic application
├── config.py              # Configuration with Secrets Manager
├── Dockerfile             # Container definition
├── cloudbuild.yaml        # Cloud Build configuration
├── requirements.txt       # Python dependencies
├── deploy.sh             # Deployment script
├── setup_secrets.sh      # Secrets setup script
├── .gcloudignore         # Files to exclude from deployment
└── .dockerignore         # Files to exclude from container
```

## 🎯 Next Steps

1. [ ] Deploy to Cloud Run: `./deploy.sh`
2. [ ] Update Chrome extension with service URL
3. [ ] Test all endpoints
4. [ ] Set up Cloud Build triggers for CI/CD (optional)
5. [ ] Configure custom domain (optional)
6. [ ] Set up monitoring alerts (optional)
