#!/bin/bash
# Script to setup Google Cloud Secrets for ClauseCodeAI

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="teachmemedical-prod"

echo -e "${GREEN}=== ClauseCodeAI Secrets Setup ===${NC}\n"
echo -e "Project: ${GREEN}${PROJECT_ID}${NC}\n"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set project
gcloud config set project $PROJECT_ID

# Enable Secret Manager API
echo -e "${YELLOW}Enabling Secret Manager API...${NC}"
gcloud services enable secretmanager.googleapis.com

# Function to create or update a secret
create_or_update_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if gcloud secrets describe $secret_name &> /dev/null; then
        echo -e "${YELLOW}Updating existing secret: ${secret_name}${NC}"
        echo -n "$secret_value" | gcloud secrets versions add $secret_name --data-file=-
    else
        echo -e "${YELLOW}Creating new secret: ${secret_name}${NC}"
        echo -n "$secret_value" | gcloud secrets create $secret_name \
            --data-file=- \
            --replication-policy="automatic"
    fi
}

# Get OpenAI API Key
echo -e "\n${GREEN}OpenAI API Key Setup${NC}"
read -p "Enter your OpenAI API key: " -s OPENAI_KEY
echo
if [ -z "$OPENAI_KEY" ]; then
    echo -e "${RED}Error: OpenAI API key is required${NC}"
    exit 1
fi
create_or_update_secret "OPENAI_API_KEY" "$OPENAI_KEY"

# Get SerpAPI Key
echo -e "\n${GREEN}SerpAPI Key Setup (optional)${NC}"
read -p "Enter your SerpAPI key (press Enter to skip): " -s SERPAPI
echo
if [ ! -z "$SERPAPI" ]; then
    create_or_update_secret "SERPAPI_KEY" "$SERPAPI"
else
    echo -e "${YELLOW}Skipping SerpAPI key${NC}"
fi

# Grant service account access to secrets
echo -e "\n${YELLOW}Granting Cloud Run service account access to secrets...${NC}"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud secrets add-iam-policy-binding OPENAI_API_KEY \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet

if [ ! -z "$SERPAPI" ]; then
    gcloud secrets add-iam-policy-binding SERPAPI_KEY \
        --member="serviceAccount:${SERVICE_ACCOUNT}" \
        --role="roles/secretmanager.secretAccessor" \
        --quiet
fi

echo -e "\n${GREEN}=== Secrets Setup Complete! ===${NC}"
echo -e "\nSecrets created in project: ${PROJECT_ID}"
echo -e "Service account granted access: ${SERVICE_ACCOUNT}"
echo -e "\nYou can now deploy the application with: ${GREEN}./deploy.sh${NC}"
