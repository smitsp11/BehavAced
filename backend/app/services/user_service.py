"""
User Service - Manages user data across all tables
Links authenticated users to their profiles, stories, plans, and practice attempts
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging

from app.core.database import get_supabase

logger = logging.getLogger(__name__)


# ============================================
# Profile Operations
# ============================================

def get_or_create_profile(auth_user_id: str, email: Optional[str] = None) -> Optional[Dict]:
    """
    Get existing profile or create a new one for the authenticated user.
    Called on first login / dashboard load.
    """
    try:
        supabase = get_supabase()
        
        # Check if profile exists
        result = supabase.table("profiles").select("*").eq("auth_user_id", auth_user_id).execute()
        
        if result.data and len(result.data) > 0:
            logger.info(f"Found existing profile for user: {auth_user_id}")
            return result.data[0]
        
        # Create new profile
        new_profile = supabase.table("profiles").insert({
            "auth_user_id": auth_user_id,
            "user_id": auth_user_id,  # Legacy field compatibility
            "is_analyzed": False
        }).execute()
        
        if new_profile.data and len(new_profile.data) > 0:
            logger.info(f"Created new profile for user: {auth_user_id}")
            return new_profile.data[0]
        
        return None
        
    except Exception as e:
        logger.error(f"get_or_create_profile error: {e}")
        return None


def get_user_profile(auth_user_id: str) -> Optional[Dict]:
    """Get user profile by auth_user_id"""
    try:
        supabase = get_supabase()
        result = supabase.table("profiles").select("*").eq("auth_user_id", auth_user_id).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        logger.error(f"get_user_profile error: {e}")
        return None


def update_user_profile(auth_user_id: str, data: Dict) -> bool:
    """Update user profile data"""
    try:
        supabase = get_supabase()
        supabase.table("profiles").update({
            **data,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("auth_user_id", auth_user_id).execute()
        
        logger.info(f"Updated profile for user: {auth_user_id}")
        return True
    except Exception as e:
        logger.error(f"update_user_profile error: {e}")
        return False


# ============================================
# Stories Operations
# ============================================

def get_user_stories(auth_user_id: str) -> List[Dict]:
    """Get all stories for a user"""
    try:
        supabase = get_supabase()
        result = supabase.table("stories").select("*").eq("auth_user_id", auth_user_id).order("created_at", desc=True).execute()
        return result.data or []
    except Exception as e:
        logger.error(f"get_user_stories error: {e}")
        return []


def create_story(auth_user_id: str, story_data: Dict) -> Optional[str]:
    """Create a new story for the user"""
    try:
        supabase = get_supabase()
        result = supabase.table("stories").insert({
            "auth_user_id": auth_user_id,
            **story_data
        }).execute()
        
        if result.data and len(result.data) > 0:
            story_id = result.data[0]["id"]
            logger.info(f"Created story {story_id} for user: {auth_user_id}")
            return story_id
        return None
    except Exception as e:
        logger.error(f"create_story error: {e}")
        return None


def update_story(auth_user_id: str, story_id: str, data: Dict) -> bool:
    """Update a story (only if owned by user)"""
    try:
        supabase = get_supabase()
        supabase.table("stories").update({
            **data,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", story_id).eq("auth_user_id", auth_user_id).execute()
        return True
    except Exception as e:
        logger.error(f"update_story error: {e}")
        return False


def delete_story(auth_user_id: str, story_id: str) -> bool:
    """Delete a story (only if owned by user)"""
    try:
        supabase = get_supabase()
        supabase.table("stories").delete().eq("id", story_id).eq("auth_user_id", auth_user_id).execute()
        logger.info(f"Deleted story {story_id} for user: {auth_user_id}")
        return True
    except Exception as e:
        logger.error(f"delete_story error: {e}")
        return False


# ============================================
# Practice Plans Operations
# ============================================

def get_user_plans(auth_user_id: str) -> List[Dict]:
    """Get all practice plans for a user"""
    try:
        supabase = get_supabase()
        result = supabase.table("practice_plans").select("*").eq("auth_user_id", auth_user_id).order("created_at", desc=True).execute()
        return result.data or []
    except Exception as e:
        logger.error(f"get_user_plans error: {e}")
        return []


def get_active_plan(auth_user_id: str) -> Optional[Dict]:
    """Get the user's active practice plan"""
    try:
        supabase = get_supabase()
        result = supabase.table("practice_plans").select("*").eq("auth_user_id", auth_user_id).eq("is_active", True).limit(1).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        logger.error(f"get_active_plan error: {e}")
        return None


def create_plan(auth_user_id: str, plan_type: str) -> Optional[str]:
    """Create a new practice plan"""
    try:
        supabase = get_supabase()
        
        # Deactivate existing plans
        supabase.table("practice_plans").update({"is_active": False}).eq("auth_user_id", auth_user_id).execute()
        
        # Create new plan
        result = supabase.table("practice_plans").insert({
            "auth_user_id": auth_user_id,
            "plan_type": plan_type,
            "start_date": datetime.utcnow().date().isoformat(),
            "is_active": True
        }).execute()
        
        if result.data and len(result.data) > 0:
            plan_id = result.data[0]["id"]
            logger.info(f"Created plan {plan_id} for user: {auth_user_id}")
            return plan_id
        return None
    except Exception as e:
        logger.error(f"create_plan error: {e}")
        return None


def update_plan_progress(auth_user_id: str, plan_id: str, current_day: int) -> bool:
    """Update plan progress"""
    try:
        supabase = get_supabase()
        supabase.table("practice_plans").update({
            "current_day": current_day
        }).eq("id", plan_id).eq("auth_user_id", auth_user_id).execute()
        return True
    except Exception as e:
        logger.error(f"update_plan_progress error: {e}")
        return False


# ============================================
# Practice Attempts Operations
# ============================================

def get_user_attempts(auth_user_id: str, limit: int = 50) -> List[Dict]:
    """Get practice attempts for a user"""
    try:
        supabase = get_supabase()
        result = supabase.table("practice_attempts").select("*").eq("auth_user_id", auth_user_id).order("created_at", desc=True).limit(limit).execute()
        return result.data or []
    except Exception as e:
        logger.error(f"get_user_attempts error: {e}")
        return []


def save_practice_attempt(
    auth_user_id: str,
    question: str,
    answer: str,
    score: int,
    feedback: Dict,
    duration_seconds: int = 0
) -> Optional[str]:
    """Save a practice attempt"""
    try:
        supabase = get_supabase()
        result = supabase.table("practice_attempts").insert({
            "auth_user_id": auth_user_id,
            "question": question,
            "answer": answer,
            "score": score,
            "feedback": feedback,
            "duration_seconds": duration_seconds
        }).execute()
        
        if result.data and len(result.data) > 0:
            attempt_id = result.data[0]["id"]
            logger.info(f"Saved practice attempt {attempt_id} for user: {auth_user_id}")
            return attempt_id
        return None
    except Exception as e:
        logger.error(f"save_practice_attempt error: {e}")
        return None


# ============================================
# Aggregate User Data
# ============================================

def get_user_dashboard_data(auth_user_id: str) -> Dict:
    """
    Get all data needed for the user dashboard.
    Combines profile, stories, plans, and recent attempts.
    """
    profile = get_user_profile(auth_user_id)
    stories = get_user_stories(auth_user_id)
    active_plan = get_active_plan(auth_user_id)
    recent_attempts = get_user_attempts(auth_user_id, limit=10)
    
    # Calculate stats
    total_attempts = len(recent_attempts)
    avg_score = sum(a.get("score", 0) for a in recent_attempts) / total_attempts if total_attempts > 0 else 0
    
    return {
        "profile": profile,
        "stories": stories,
        "stories_count": len(stories),
        "active_plan": active_plan,
        "recent_attempts": recent_attempts,
        "stats": {
            "total_practice_sessions": total_attempts,
            "average_score": round(avg_score, 1),
            "stories_created": len(stories),
            "plan_active": active_plan is not None
        }
    }

