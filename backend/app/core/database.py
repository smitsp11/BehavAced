"""
Supabase PostgreSQL Database Client
Secure connection to Supabase for persistent data storage
"""
from supabase import create_client, Client
from app.core.config import settings
import logging
from typing import Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Singleton client instance
_supabase_client: Optional[Client] = None


def get_supabase() -> Client:
    """
    Get or create Supabase client (singleton pattern)
    Uses service role key for backend operations
    """
    global _supabase_client
    
    if _supabase_client is None:
        if not settings.SUPABASE_URL:
            raise ValueError("SUPABASE_URL environment variable is not set")
        if not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError("SUPABASE_SERVICE_ROLE_KEY environment variable is not set")
        
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        logger.info("✓ Supabase client initialized")
    
    return _supabase_client


# ============================================
# Demo Cache Operations
# ============================================

def get_cached_demo_answer(question: str) -> Optional[str]:
    """
    Get cached demo answer from database
    Returns None if not found
    """
    try:
        supabase = get_supabase()
        result = supabase.table("demo_cache").select("answer").eq("question", question).execute()
        
        if result.data and len(result.data) > 0:
            logger.info(f"Cache hit for: {question[:50]}...")
            return result.data[0]["answer"]
        
        return None
    except Exception as e:
        logger.warning(f"Cache lookup failed: {e}")
        return None


def cache_demo_answer(question: str, answer: str, role_context: Optional[str] = None) -> bool:
    """
    Cache a demo answer in the database
    Uses upsert to update if exists
    """
    try:
        supabase = get_supabase()
        supabase.table("demo_cache").upsert({
            "question": question,
            "answer": answer,
            "role_context": role_context,
            "updated_at": datetime.utcnow().isoformat()
        }, on_conflict="question").execute()
        
        logger.info(f"Cached answer for: {question[:50]}...")
        return True
    except Exception as e:
        logger.error(f"Cache save failed: {e}")
        return False


def get_cache_stats() -> dict:
    """Get cache statistics"""
    try:
        supabase = get_supabase()
        result = supabase.table("demo_cache").select("question", count="exact").execute()
        
        return {
            "total_cached": result.count or 0,
            "questions": [r["question"][:50] + "..." for r in (result.data or [])[:10]]
        }
    except Exception as e:
        logger.error(f"Cache stats failed: {e}")
        return {"total_cached": 0, "questions": [], "error": str(e)}


def clear_demo_cache() -> int:
    """Clear all cached demo answers (for testing)"""
    try:
        supabase = get_supabase()
        # Get count first
        result = supabase.table("demo_cache").select("id", count="exact").execute()
        count = result.count or 0
        
        # Delete all
        supabase.table("demo_cache").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        
        logger.info(f"Cleared {count} cached answers")
        return count
    except Exception as e:
        logger.error(f"Cache clear failed: {e}")
        return 0


# ============================================
# User Profile Operations
# ============================================

def save_user_profile(user_id: str, data: dict) -> bool:
    """Save or update user profile"""
    try:
        supabase = get_supabase()
        supabase.table("user_profiles").upsert({
            "user_id": user_id,
            "updated_at": datetime.utcnow().isoformat(),
            **data
        }, on_conflict="user_id").execute()
        return True
    except Exception as e:
        logger.error(f"Profile save failed: {e}")
        return False


def get_user_profile(user_id: str) -> Optional[dict]:
    """Get user profile by user_id"""
    try:
        supabase = get_supabase()
        result = supabase.table("user_profiles").select("*").eq("user_id", user_id).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        logger.error(f"Profile fetch failed: {e}")
        return None


# ============================================
# Story Operations
# ============================================

def save_story(user_id: str, story_data: dict) -> bool:
    """Save a story to the database"""
    try:
        supabase = get_supabase()
        supabase.table("stories").upsert({
            "user_id": user_id,
            "updated_at": datetime.utcnow().isoformat(),
            **story_data
        }, on_conflict="story_id").execute()
        return True
    except Exception as e:
        logger.error(f"Story save failed: {e}")
        return False


def get_user_stories(user_id: str) -> list:
    """Get all stories for a user"""
    try:
        supabase = get_supabase()
        result = supabase.table("stories").select("*").eq("user_id", user_id).execute()
        return result.data or []
    except Exception as e:
        logger.error(f"Stories fetch failed: {e}")
        return []


# ============================================
# Health Check
# ============================================

def check_database_connection() -> dict:
    """Check if database connection is working"""
    try:
        supabase = get_supabase()
        # Simple query to test connection
        result = supabase.table("demo_cache").select("id").limit(1).execute()
        return {"status": "connected", "message": "Database connection successful"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

