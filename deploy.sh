#!/bin/bash
# Deployment script for ClauseCodeAI to Google Cloud Run
# Uses Artifact Registry in teachmemedical-prod project

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="teachmemedical-prod"
SERVICE_NAME="clausecodeai"
REGION="us-central1"
REPOSITORY="tmm-apps"
IMAGE_NAME="clausecodeai"

echo -e "${GREEN}=== ClauseCodeAI Cloud Run Deployment ===${NC}\n"
echo -e "Project: ${GREEN}${PROJECT_ID}${NC}"
echo -e "Service: ${GREEN}${SERVICE_NAME}${NC}"
echo -e "Region: ${GREEN}${REGION}${NC}"
echo -e "Repository: ${GREEN}${REPOSITORY}${NC}\n"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set project
echo -e "${YELLOW}Setting project...${NC}"
gcloud config set project $PROJECT_ID

# Confirm deployment
read -p "Deploy to Cloud Run? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# Enable required APIs
echo -e "\n${YELLOW}Enabling required APIs...${NC}"
gcloud services enable \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  --project "$PROJECT_ID" \
  --quiet

# Create Artifact Registry repository if it doesn't exist
echo -e "\n${YELLOW}Ensuring Artifact Registry repository exists...${NC}"
gcloud artifacts repositories create "$REPOSITORY" \
  --repository-format=docker \
  --location="$REGION" \
  --project="$PROJECT_ID" \
  --quiet 2>/dev/null || echo "Repository already exists"

# Configure Docker auth
echo -e "\n${YELLOW}Configuring Docker authentication...${NC}"
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# Build image tag
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:latest"

# Build and deploy using Cloud Build
echo -e "\n${YELLOW}Building and deploying to Cloud Run...${NC}"
echo -e "Image: ${IMAGE_TAG}\n"
gcloud builds submit --config cloudbuild.yaml --project "$PROJECT_ID"

# Get service URL
echo -e "\n${YELLOW}Getting service URL...${NC}"
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
  --platform managed \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --format 'value(status.url)' 2>/dev/null || echo "")

if [ -z "$SERVICE_URL" ]; then
    echo -e "${RED}Error: Could not get service URL${NC}"
    exit 1
fi

echo -e "\n${GREEN}=== Deployment Complete! ===${NC}"
echo -e "Service URL: ${GREEN}${SERVICE_URL}${NC}"
echo -e "Image: ${IMAGE_TAG}"
echo -e "\nTest the service:"
echo -e "  curl ${SERVICE_URL}/health"
echo -e "\nView logs:"
echo -e "  gcloud run services logs read ${SERVICE_NAME} --region ${REGION} --project ${PROJECT_ID}"
echo -e "\nUpdate Chrome extension SERVER_URL to: ${SERVICE_URL}"
