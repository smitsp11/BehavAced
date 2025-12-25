"""
Supabase PostgreSQL Database Client
Secure connection to Supabase for persistent data storage
Updated for supabase-py v2.27.0
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
        
        try:
            _supabase_client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
            logger.info("✓ Supabase client initialized")
        except Exception as e:
            logger.error(f"Failed to create Supabase client: {e}")
            raise
    
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
# User Profile Operations (Profile Vault)
# ============================================

def create_user_profile(
    work_style: Optional[str] = None,
    communication_style: Optional[str] = None,
    raw_resume_text: Optional[str] = None
) -> Optional[str]:
    """
    Create a new user profile in the Profile Vault
    Returns the generated UUID if successful, None otherwise
    """
    try:
        supabase = get_supabase()
        result = supabase.table("user_profiles").insert({
            "work_style": work_style,
            "communication_style": communication_style,
            "raw_resume_text": raw_resume_text,
            "is_processed": False
        }).execute()
        
        if result.data and len(result.data) > 0:
            profile_id = result.data[0]["id"]
            logger.info(f"✓ Created user profile: {profile_id}")
            return profile_id
        return None
    except Exception as e:
        logger.error(f"Profile creation failed: {e}")
        return None


def update_user_profile(profile_id: str, data: dict) -> bool:
    """Update an existing user profile"""
    try:
        supabase = get_supabase()
        supabase.table("user_profiles").update({
            **data,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", profile_id).execute()
        
        logger.info(f"✓ Updated user profile: {profile_id}")
        return True
    except Exception as e:
        logger.error(f"Profile update failed: {e}")
        return False


def get_user_profile(profile_id: str) -> Optional[dict]:
    """Get user profile by ID"""
    try:
        supabase = get_supabase()
        result = supabase.table("user_profiles").select("*").eq("id", profile_id).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        logger.error(f"Profile fetch failed: {e}")
        return None


def get_unprocessed_profiles() -> list:
    """Get all profiles that haven't been processed yet"""
    try:
        supabase = get_supabase()
        result = supabase.table("user_profiles").select("*").eq("is_processed", False).execute()
        return result.data or []
    except Exception as e:
        logger.error(f"Unprocessed profiles fetch failed: {e}")
        return []


def mark_profile_processed(profile_id: str) -> bool:
    """Mark a profile as processed"""
    try:
        supabase = get_supabase()
        supabase.table("user_profiles").update({
            "is_processed": True,
            "processed_at": datetime.utcnow().isoformat()
        }).eq("id", profile_id).execute()
        
        logger.info(f"✓ Marked profile as processed: {profile_id}")
        return True
    except Exception as e:
        logger.error(f"Profile mark processed failed: {e}")
        return False


# ============================================
# Story Operations
# ============================================

def create_story(
    user_id: str,
    title: str,
    star_response: dict,
    tags: list
) -> Optional[str]:
    """
    Create a new story linked to a user profile
    Returns the story ID if successful
    """
    try:
        supabase = get_supabase()
        result = supabase.table("stories").insert({
            "user_id": user_id,
            "title": title,
            "star_response": star_response,
            "tags": tags
        }).execute()
        
        if result.data and len(result.data) > 0:
            story_id = result.data[0]["id"]
            logger.info(f"✓ Created story: {story_id}")
            return story_id
        return None
    except Exception as e:
        logger.error(f"Story creation failed: {e}")
        return None


def get_user_stories(user_id: str) -> list:
    """Get all stories for a user"""
    try:
        supabase = get_supabase()
        result = supabase.table("stories").select("*").eq("user_id", user_id).execute()
        return result.data or []
    except Exception as e:
        logger.error(f"Stories fetch failed: {e}")
        return []


def get_stories_by_tag(user_id: str, tag: str) -> list:
    """Get stories filtered by tag"""
    try:
        supabase = get_supabase()
        result = supabase.table("stories").select("*").eq("user_id", user_id).contains("tags", [tag]).execute()
        return result.data or []
    except Exception as e:
        logger.error(f"Stories by tag fetch failed: {e}")
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
