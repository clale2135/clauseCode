"""
Database module for ClauseCode AI
Uses Firebase Firestore for cloud storage of analysis data
"""
import os
import logging
from datetime import datetime
from typing import Dict, Optional, Any
import firebase_admin
from firebase_admin import credentials, firestore

logger = logging.getLogger(__name__)


class AnalysisDB:
    """Database service for storing analysis data in Firestore"""
    
    def __init__(self):
        self.db = None
        self.initialized = False
    
    async def initialize(self):
        """Initialize Firebase connection"""
        if self.initialized:
            return
            
        try:
            # Check if Firebase is already initialized
            if not firebase_admin._apps:
                # Try to load credentials from file
                cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-credentials.json")
                
                if os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                    logger.info(f"Firebase initialized with credentials from {cred_path}")
                else:
                    # Try default credentials (works on Cloud Run)
                    try:
                        firebase_admin.initialize_app()
                        logger.info("Firebase initialized with default credentials")
                    except Exception as e:
                        logger.warning(f"Firebase initialization failed: {e}")
                        logger.warning("Continuing without Firestore (CSV-only mode)")
                        return
            
            self.db = firestore.client()
            self.initialized = True
            logger.info("Firestore client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firestore: {e}", exc_info=True)
            logger.warning("Continuing without Firestore (CSV-only mode)")
    
    async def close(self):
        """Close database connections (no-op for Firestore)"""
        pass
    
    async def save_analysis(self, 
                          timestamp: str,
                          agent: str,
                          analysis_type: str,
                          page_title: str,
                          page_url: str,
                          result_text: str,
                          page_content: Optional[str] = None,
                          user_id: Optional[str] = None,
                          metadata: Optional[Dict[str, Any]] = None) -> Optional[str]:
        """
        Save analysis data to Firestore
        
        Returns: Document ID if successful, None if database not available
        """
        if not self.db:
            logger.debug("Firestore not available, skipping save")
            return None
        
        try:
            # Parse timestamp or use current time
            try:
                timestamp_dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            except:
                timestamp_dt = datetime.utcnow()
            
            # Prepare document data
            doc_data = {
                "timestamp": timestamp_dt,
                "agent": agent,
                "analysis_type": analysis_type,
                "page_title": page_title,
                "page_url": page_url,
                "result_text": result_text,
                "created_at": datetime.utcnow(),
            }
            
            # Add optional fields
            if page_content:
                doc_data["page_content"] = page_content
            
            if user_id:
                doc_data["user_id"] = user_id
            
            if metadata:
                doc_data["metadata"] = metadata
            
            # Save to Firestore collection
            doc_ref = self.db.collection("clausecode_analyses").add(doc_data)
            doc_id = doc_ref[1].id
            
            logger.info(f"✅ Saved analysis to Firestore: {doc_id}")
            return doc_id
            
        except Exception as e:
            logger.error(f"Failed to save to Firestore: {e}", exc_info=True)
            return None
    
    async def get_analysis(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Get a single analysis by document ID"""
        if not self.db:
            return None
        
        try:
            doc_ref = self.db.collection("clausecode_analyses").document(doc_id)
            doc = doc_ref.get()
            
            if doc.exists:
                return doc.to_dict()
            return None
            
        except Exception as e:
            logger.error(f"Failed to get analysis: {e}")
            return None
    
    async def list_analyses(self, 
                           limit: int = 50,
                           agent: Optional[str] = None,
                           analysis_type: Optional[str] = None,
                           user_id: Optional[str] = None) -> list:
        """
        List analyses with optional filtering
        
        Args:
            limit: Maximum number of results
            agent: Filter by agent/persona
            analysis_type: Filter by analysis type
            user_id: Filter by user ID
        """
        if not self.db:
            return []
        
        try:
            # Start with base query - fetch more than limit for client-side filtering
            fetch_limit = limit * 10 if (agent or analysis_type or user_id) else limit
            query = self.db.collection("clausecode_analyses")
            query = query.order_by("timestamp", direction=firestore.Query.DESCENDING)
            query = query.limit(fetch_limit)
            
            # Execute query
            docs = query.stream()
            results = []
            
            # Client-side filtering (works without indexes)
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                
                # Apply filters
                if agent and data.get("agent") != agent:
                    continue
                
                if analysis_type and data.get("analysis_type") != analysis_type:
                    continue
                
                if user_id and data.get("user_id") != user_id:
                    continue
                
                results.append(data)
                
                # Stop if we have enough results
                if len(results) >= limit:
                    break
            
            logger.info(f"Retrieved {len(results)} analyses from Firestore")
            return results
            
        except Exception as e:
            logger.error(f"Failed to list analyses: {e}")
            return []
    
    async def delete_analysis(self, doc_id: str) -> bool:
        """Delete a single analysis by document ID"""
        if not self.db:
            return False
        
        try:
            doc_ref = self.db.collection("clausecode_analyses").document(doc_id)
            doc_ref.delete()
            logger.info(f"✅ Deleted analysis from Firestore: {doc_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete analysis: {e}")
            return False


# Global database instance
_db_instance: Optional[AnalysisDB] = None


async def get_db() -> Optional[AnalysisDB]:
    """
    Get database instance (singleton)
    Returns None if database is not available (allows fallback to CSV-only)
    """
    global _db_instance
    if _db_instance is None:
        _db_instance = AnalysisDB()
        try:
            await _db_instance.initialize()
        except Exception as e:
            logger.warning(f"Database initialization failed: {e}")
            return None
    return _db_instance if _db_instance.initialized else None
