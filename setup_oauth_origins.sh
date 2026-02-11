#!/bin/bash
# Script to programmatically update Google OAuth authorized origins
# This adds localhost origins for development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Google OAuth Origins Setup ===${NC}\n"

# Configuration
PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-$(gcloud config get-value project)}"
CLIENT_ID="761223278824-ijp6lq944kp1lapmcgubvh8pq65r67t3.apps.googleusercontent.com"

# Extract just the client ID number
CLIENT_ID_SHORT=$(echo $CLIENT_ID | cut -d'-' -f1)

echo -e "Project ID: ${GREEN}${PROJECT_ID}${NC}"
echo -e "Client ID: ${GREEN}${CLIENT_ID}${NC}\n"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set project
echo -e "${YELLOW}Setting project...${NC}"
gcloud config set project $PROJECT_ID

# Get current OAuth client configuration
echo -e "\n${YELLOW}Fetching current OAuth client configuration...${NC}"
OAUTH_CLIENT=$(gcloud alpha iap oauth-clients describe $CLIENT_ID --format=json 2>/dev/null || echo "{}")

if [ "$OAUTH_CLIENT" = "{}" ]; then
    echo -e "${YELLOW}Note: Using alternative method to update OAuth client${NC}"
fi

# Define origins to add
ORIGINS=(
    "http://localhost:8000"
    "http://localhost:5001"
    "http://127.0.0.1:8000"
    "http://127.0.0.1:5001"
)

# Define redirect URIs
REDIRECT_URIS=(
    "http://localhost:8000/auth/google/callback"
    "http://localhost:5001/auth/google/callback"
    "http://127.0.0.1:8000/auth/google/callback"
    "http://127.0.0.1:5001/auth/google/callback"
)

echo -e "\n${YELLOW}Origins to add:${NC}"
for origin in "${ORIGINS[@]}"; do
    echo "  - $origin"
done

echo -e "\n${YELLOW}Redirect URIs to add:${NC}"
for uri in "${REDIRECT_URIS[@]}"; do
    echo "  - $uri"
done

echo -e "\n${YELLOW}Note: You need to update these manually in Google Cloud Console${NC}"
echo -e "The gcloud CLI doesn't support updating OAuth client origins directly.\n"

echo -e "${GREEN}Opening Google Cloud Console OAuth Credentials page...${NC}"
CONSOLE_URL="https://console.cloud.google.com/apis/credentials/oauthclient/${CLIENT_ID}?project=${PROJECT_ID}"
echo -e "URL: ${CONSOLE_URL}\n"

# Try to open in browser
if command -v open &> /dev/null; then
    open "$CONSOLE_URL"
elif command -v xdg-open &> /dev/null; then
    xdg-open "$CONSOLE_URL"
else
    echo -e "${YELLOW}Please open this URL manually:${NC}"
    echo "$CONSOLE_URL"
fi

echo -e "\n${GREEN}=== Manual Steps Required ===${NC}"
echo -e "1. In the opened browser window, scroll to 'Authorized JavaScript origins'"
echo -e "2. Click 'ADD URI' and add each of these origins:"
for origin in "${ORIGINS[@]}"; do
    echo -e "   ${GREEN}${origin}${NC}"
done
echo -e "\n3. Scroll to 'Authorized redirect URIs'"
echo -e "4. Click 'ADD URI' and add each of these redirect URIs:"
for uri in "${REDIRECT_URIS[@]}"; do
    echo -e "   ${GREEN}${uri}${NC}"
done
echo -e "\n5. Click 'SAVE' at the bottom"
echo -e "\n${YELLOW}Note: Changes may take 5-10 minutes to propagate${NC}"

# Alternative: Create a JSON patch file for manual upload
echo -e "\n${YELLOW}Creating a reference configuration file...${NC}"
cat > oauth_origins_config.json <<EOF
{
  "authorized_origins": [
$(IFS=,; printf '    "%s"\n' "${ORIGINS[@]}" | sed '$ ! s/$/,/')
  ],
  "authorized_redirect_uris": [
$(IFS=,; printf '    "%s"\n' "${REDIRECT_URIS[@]}" | sed '$ ! s/$/,/')
  ]
}
EOF

echo -e "${GREEN}Created oauth_origins_config.json for reference${NC}"
echo -e "\n${GREEN}=== Setup Complete ===${NC}"
echo -e "After updating in the console, restart your server and try signing in again."
