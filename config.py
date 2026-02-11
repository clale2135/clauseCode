"""
Configuration management for ClauseCodeAI
Handles environment variables and Google Cloud Secrets Manager integration
"""
import os
import logging
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

logger = logging.getLogger(__name__)


def get_secret_from_gcp(secret_name: str, project_id: Optional[str] = None) -> Optional[str]:
    """Fetch secret from Google Cloud Secrets Manager as fallback"""
    try:
        from google.cloud import secretmanager
        
        if not project_id:
            project_id = os.getenv("GOOGLE_CLOUD_PROJECT") or os.getenv("GCP_PROJECT") or "teachmemedical-prod"
        
        logger.info(f"Attempting to fetch secret {secret_name} from project {project_id}")
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{project_id}/secrets/{secret_name}/versions/latest"
        response = client.access_secret_version(request={"name": name})
        value = response.payload.data.decode("UTF-8").strip()
        logger.info(f"Successfully retrieved secret {secret_name}")
        return value
    except ImportError:
        logger.warning("google-cloud-secret-manager not available")
        return None
    except Exception as e:
        logger.error(f"Could not fetch {secret_name} from GCP Secrets Manager: {e}")
        return None


def get_env_or_secret(env_var: str, secret_name: Optional[str] = None) -> Optional[str]:
    """Get value from environment variable, or fallback to Google Secrets Manager"""
    value = os.getenv(env_var)
    if value:
        return value.strip()
    
    # Fallback to Google Secrets Manager if secret name provided
    if secret_name:
        return get_secret_from_gcp(secret_name)
    
    return None


class AppConfig:
    """Application configuration"""
    
    # Server
    HOST = os.getenv("HOST", "0.0.0.0")
    # Cloud Run sets PORT environment variable
    PORT = int(os.getenv("PORT", 5001))
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    
    # OpenAI API
    OPENAI_API_KEY = get_env_or_secret("OPENAI_API_KEY", "OPENAI_API_KEY")
    
    # SerpAPI
    SERPAPI_KEY = get_env_or_secret("SERPAPI_KEY", "SERPAPI_KEY")
    
    # ElevenLabs TTS API
    ELEVENLABS_API_KEY = get_env_or_secret("ELEVENLABS_API_KEY", "ELEVENLABS_API_KEY")
    
    # CSV storage path - disable on cloud deployments (ephemeral filesystem)
    IS_CLOUD_DEPLOYMENT = bool(os.getenv('RAILWAY_ENVIRONMENT_NAME') or os.getenv('K_SERVICE'))
    USE_CSV = not IS_CLOUD_DEPLOYMENT  # Disable CSV on cloud
    
    import tempfile
    csv_dir = tempfile.gettempdir() if IS_CLOUD_DEPLOYMENT else os.path.dirname(__file__)
    CSV_FILE = os.path.join(csv_dir, 'analysis_data.csv')
    HEADERS = ['Timestamp', 'Agent', 'Analysis Type', 'Page Title', 'Page URL', 'Result Text']
    
    # Firebase/Firestore
    FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-credentials.json")
    FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
    
    # Feature flags
    USE_FIRESTORE = os.getenv("USE_FIRESTORE", "true").lower() == "true"
    
    # Google OAuth (prioritize .env, fallback to Secret Manager for Cloud Run)
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID") or get_secret_from_gcp("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET") or get_secret_from_gcp("GOOGLE_CLIENT_SECRET")
    # Session secret for cookie signing
    SESSION_SECRET = os.getenv("SESSION_SECRET") or get_secret_from_gcp("SESSION_SECRET") or "dev-secret-key-change-in-production"


config = AppConfig()
