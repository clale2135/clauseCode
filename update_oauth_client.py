#!/usr/bin/env python3
"""
Programmatically update Google OAuth Client authorized origins
Requires: google-auth, google-auth-oauthlib, google-auth-httplib2
Install: pip install google-auth google-auth-oauthlib google-auth-httplib2
"""

import json
import sys
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Configuration
PROJECT_ID = "teachmemedical-prod"  # Will be replaced from env
CLIENT_ID = "761223278824-ijp6lq944kp1lapmcgubvh8pq65r67t3"

# Origins to add
AUTHORIZED_ORIGINS = [
    "http://localhost:8000",
    "http://localhost:5001",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:5001",
]

# Redirect URIs to add
REDIRECT_URIS = [
    "http://localhost:8000/auth/google/callback",
    "http://localhost:5001/auth/google/callback",
    "http://127.0.0.1:8000/auth/google/callback",
    "http://127.0.0.1:5001/auth/google/callback",
]


def get_credentials():
    """Get credentials for Google Cloud API"""
    try:
        # Try to use application default credentials
        from google.auth import default
        credentials, project = default(
            scopes=['https://www.googleapis.com/auth/cloud-platform']
        )
        return credentials
    except Exception as e:
        print(f"Error getting credentials: {e}")
        print("\nPlease run: gcloud auth application-default login")
        sys.exit(1)


def update_oauth_client():
    """Update OAuth client with authorized origins"""
    try:
        credentials = get_credentials()
        
        # Note: There's no direct API to update OAuth clients
        # This is a limitation of Google Cloud Platform
        print("⚠️  Google Cloud Platform does not provide a public API to update OAuth client origins.")
        print("You must update these manually in the Google Cloud Console.\n")
        
        # Generate the console URL
        console_url = f"https://console.cloud.google.com/apis/credentials/oauthclient/{CLIENT_ID}.apps.googleusercontent.com?project={PROJECT_ID}"
        
        print(f"🌐 Opening Google Cloud Console...")
        print(f"URL: {console_url}\n")
        
        # Try to open browser
        import webbrowser
        webbrowser.open(console_url)
        
        print("📋 Add these Authorized JavaScript origins:")
        for origin in AUTHORIZED_ORIGINS:
            print(f"   ✓ {origin}")
        
        print("\n📋 Add these Authorized redirect URIs:")
        for uri in REDIRECT_URIS:
            print(f"   ✓ {uri}")
        
        print("\n💾 Click 'SAVE' when done")
        print("⏱️  Changes may take 5-10 minutes to propagate\n")
        
        # Save to file for reference
        config = {
            "client_id": f"{CLIENT_ID}.apps.googleusercontent.com",
            "project_id": PROJECT_ID,
            "authorized_origins": AUTHORIZED_ORIGINS,
            "authorized_redirect_uris": REDIRECT_URIS
        }
        
        with open('oauth_config_reference.json', 'w') as f:
            json.dump(config, f, indent=2)
        
        print("✅ Created oauth_config_reference.json for your records")
        
    except HttpError as e:
        print(f"❌ HTTP Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


def verify_setup():
    """Verify that the origins are set up correctly"""
    print("\n🔍 To verify your setup:")
    print("1. Go to: https://console.cloud.google.com/apis/credentials")
    print(f"2. Find client ID: {CLIENT_ID}")
    print("3. Verify all origins and redirect URIs are listed")
    print("4. Test sign-in at http://localhost:8000")


if __name__ == "__main__":
    print("=" * 60)
    print("Google OAuth Client Configuration Updater")
    print("=" * 60)
    print()
    
    update_oauth_client()
    verify_setup()
    
    print("\n" + "=" * 60)
    print("✅ Setup guide complete!")
    print("=" * 60)
