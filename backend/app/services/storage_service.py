"""
Storage Service - In-memory storage for MVP (can be replaced with Supabase)
"""
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid
import json
import os
from pathlib import Path
from app.core.config import settings


class StorageService:
    """Simple in-memory storage for MVP demo"""
    
    def __init__(self):
        self.users: Dict[str, Any] = {}
        self.profiles: Dict[str, Any] = {}
        self.stories: Dict[str, List[Any]] = {}
        self.attempts: Dict[str, List[Any]] = {}
        self.plans: Dict[str, Any] = {}
        
        # Cache directory for dev mode
        # Handle both running from project root or backend directory
        current_dir = Path.cwd()
        if current_dir.name == "backend":
            # Running from backend directory
            self.cache_dir = Path(".cache")
        else:
            # Running from project root
            self.cache_dir = Path("backend/.cache")
        self.cache_file = self.cache_dir / "profile.json"
        
        # Auto-load cached profile in dev mode
        if settings.ENVIRONMENT == "development":
            self._load_cached_profile()
    
    # User Profile Methods
    def save_profile(self, user_id: str, profile_data: dict) -> bool:
        """Save user profile"""
        self.profiles[user_id] = {
            **profile_data,
            "user_id": user_id,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        return True
    
    def get_profile(self, user_id: str) -> Optional[dict]:
        """Get user profile"""
        return self.profiles.get(user_id)
    
    def update_profile(self, user_id: str, updates: dict) -> bool:
        """Update user profile"""
        if user_id in self.profiles:
            self.profiles[user_id].update(updates)
            self.profiles[user_id]["updated_at"] = datetime.now().isoformat()
            return True
        return False
    
    # Story Methods
    def save_stories(self, user_id: str, stories: List[dict]) -> bool:
        """Save user stories"""
        self.stories[user_id] = stories
        return True
    
    def get_stories(self, user_id: str) -> List[dict]:
        """Get user stories"""
        return self.stories.get(user_id, [])
    
    def get_story(self, user_id: str, story_id: str) -> Optional[dict]:
        """Get specific story"""
        user_stories = self.stories.get(user_id, [])
        for story in user_stories:
            if story.get("story_id") == story_id:
                return story
        return None
    
    def add_story(self, user_id: str, story: dict) -> bool:
        """Add a new story"""
        if user_id not in self.stories:
            self.stories[user_id] = []
        self.stories[user_id].append(story)
        return True
    
    # Practice Attempt Methods
    def save_attempt(self, user_id: str, attempt: dict) -> bool:
        """Save practice attempt"""
        if user_id not in self.attempts:
            self.attempts[user_id] = []
        
        attempt["attempt_id"] = str(uuid.uuid4())
        attempt["created_at"] = datetime.now().isoformat()
        self.attempts[user_id].append(attempt)
        return True
    
    def get_attempts(self, user_id: str, limit: int = 10) -> List[dict]:
        """Get user's practice attempts"""
        user_attempts = self.attempts.get(user_id, [])
        return sorted(user_attempts, key=lambda x: x["created_at"], reverse=True)[:limit]
    
    def get_attempt(self, user_id: str, attempt_id: str) -> Optional[dict]:
        """Get specific attempt"""
        user_attempts = self.attempts.get(user_id, [])
        for attempt in user_attempts:
            if attempt.get("attempt_id") == attempt_id:
                return attempt
        return None
    
    # Practice Plan Methods
    def save_plan(self, user_id: str, plan: dict) -> bool:
        """Save practice plan"""
        plan["plan_id"] = str(uuid.uuid4())
        plan["user_id"] = user_id
        plan["created_at"] = datetime.now().isoformat()
        self.plans[user_id] = plan
        return True
    
    def get_plan(self, user_id: str) -> Optional[dict]:
        """Get user's current practice plan"""
        return self.plans.get(user_id)
    
    def update_plan_progress(self, user_id: str, day: int, task_index: int, completed: bool) -> bool:
        """Update progress on plan task"""
        if user_id in self.plans:
            plan = self.plans[user_id]
            if "progress" not in plan:
                plan["progress"] = {}
            
            key = f"day_{day}_task_{task_index}"
            plan["progress"][key] = {
                "completed": completed,
                "completed_at": datetime.now().isoformat() if completed else None
            }
            return True
        return False
    
    # Utility Methods
    def create_user_id(self) -> str:
        """Generate new user ID"""
        return str(uuid.uuid4())
    
    def user_exists(self, user_id: str) -> bool:
        """Check if user exists"""
        return user_id in self.profiles
    
    # Cache Methods (dev mode only)
    def _load_cached_profile(self) -> bool:
        """Load cached profile from disk (dev mode only)"""
        if settings.ENVIRONMENT != "development":
            return False
        
        if not self.cache_file.exists():
            return False
        
        try:
            with open(self.cache_file, 'r') as f:
                cached_data = json.load(f)
            
            # Restore profile data
            if "profile" in cached_data and cached_data["profile"]:
                user_id = cached_data["profile"].get("user_id")
                if user_id:
                    self.profiles[user_id] = cached_data["profile"]
            
            # Restore stories
            if "stories" in cached_data and cached_data["stories"]:
                user_id = cached_data.get("user_id")
                if user_id:
                    self.stories[user_id] = cached_data["stories"]
            
            return True
        except Exception as e:
            print(f"Warning: Failed to load cached profile: {e}")
            return False
    
    def save_cached_profile(self, user_id: str) -> bool:
        """Save current profile to cache file (dev mode only)"""
        if settings.ENVIRONMENT != "development":
            return False
        
        try:
            # Create cache directory if it doesn't exist
            self.cache_dir.mkdir(parents=True, exist_ok=True)
            
            # Get current profile and stories
            profile_data = self.profiles.get(user_id)
            stories_data = self.stories.get(user_id, [])
            
            if not profile_data:
                return False
            
            # Prepare cache data
            cache_data = {
                "user_id": user_id,
                "profile": profile_data,
                "stories": stories_data,
                "cached_at": datetime.now().isoformat()
            }
            
            # Write to cache file
            with open(self.cache_file, 'w') as f:
                json.dump(cache_data, f, indent=2, default=str)
            
            return True
        except Exception as e:
            print(f"Error saving cached profile: {e}")
            return False
    
    def load_cached_profile(self) -> Optional[Dict[str, Any]]:
        """Load cached profile data (dev mode only)"""
        if settings.ENVIRONMENT != "development":
            return None
        
        if not self.cache_file.exists():
            return None
        
        try:
            with open(self.cache_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading cached profile: {e}")
            return None
    
    def clear_cached_profile(self) -> bool:
        """Clear cached profile file (dev mode only)"""
        if settings.ENVIRONMENT != "development":
            return False
        
        try:
            if self.cache_file.exists():
                self.cache_file.unlink()
            return True
        except Exception as e:
            print(f"Error clearing cached profile: {e}")
            return False


# Global instance
storage = StorageService()

