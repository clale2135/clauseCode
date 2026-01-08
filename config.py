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
            # Try to get project ID from environment or gcloud config
            project_id = os.getenv("GOOGLE_CLOUD_PROJECT") or os.getenv("GCP_PROJECT")
            if not project_id:
                # Try to get from gcloud config
                import subprocess
                try:
                    result = subprocess.run(
                        ["gcloud", "config", "get-value", "project"],
                        capture_output=True,
                        text=True,
                        timeout=2
                    )
                    if result.returncode == 0:
                        project_id = result.stdout.strip()
                except Exception:
                    pass
        
        if not project_id:
            return None
        
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{project_id}/secrets/{secret_name}/versions/latest"
        response = client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8").strip()
    except ImportError:
        logger.debug("google-cloud-secret-manager not available")
        return None
    except Exception as e:
        logger.debug(f"Could not fetch {secret_name} from GCP Secrets Manager: {e}")
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
    
    # CSV storage path - use /tmp for cloud deployments
    import tempfile
    csv_dir = tempfile.gettempdir() if os.getenv('RAILWAY_ENVIRONMENT_NAME') or os.getenv('K_SERVICE') else os.path.dirname(__file__)
    CSV_FILE = os.path.join(csv_dir, 'analysis_data.csv')
    HEADERS = ['Timestamp', 'Agent', 'Analysis Type', 'Page Title', 'Page URL', 'Result Text']


config = AppConfig()
