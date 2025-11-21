"""
Development API Routes - Dev-only utilities for caching profiles
"""
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import ProfileResponse
from app.services import storage
from app.core.config import settings

router = APIRouter()


@router.post("/save-profile/{user_id}")
async def save_cached_profile(user_id: str):
    """
    Save current profile to cache file (dev mode only)
    
    This allows you to save your profile locally so it persists across restarts.
    Only works in development environment.
    """
    if settings.ENVIRONMENT != "development":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only available in development mode"
        )
    
    success = storage.save_cached_profile(user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found or could not be saved"
        )
    
    return {
        "success": True,
        "message": "Profile saved to cache",
        "cache_file": str(storage.cache_file),
        "user_id": user_id
    }


@router.get("/load-profile")
async def load_cached_profile():
    """
    Load cached profile data (dev mode only)
    
    Returns the cached profile if it exists.
    Only works in development environment.
    """
    if settings.ENVIRONMENT != "development":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only available in development mode"
        )
    
    cached_data = storage.load_cached_profile()
    
    if not cached_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No cached profile found"
        )
    
    user_id = cached_data.get("user_id")
    profile_data = cached_data.get("profile", {})
    
    return {
        "success": True,
        "user_id": user_id,
        "profile": profile_data,
        "cached_at": cached_data.get("cached_at"),
        "message": "Cached profile loaded"
    }


@router.post("/clear-cache")
async def clear_cached_profile():
    """
    Clear cached profile file (dev mode only)
    
    Only works in development environment.
    """
    if settings.ENVIRONMENT != "development":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only available in development mode"
        )
    
    success = storage.clear_cached_profile()
    
    return {
        "success": success,
        "message": "Cache cleared" if success else "No cache to clear"
    }


@router.get("/cache-status")
async def get_cache_status():
    """
    Get cache file status (dev mode only)
    
    Only works in development environment.
    """
    if settings.ENVIRONMENT != "development":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only available in development mode"
        )
    
    cache_exists = storage.cache_file.exists()
    
    result = {
        "cache_file": str(storage.cache_file),
        "exists": cache_exists,
        "environment": settings.ENVIRONMENT
    }
    
    if cache_exists:
        cached_data = storage.load_cached_profile()
        if cached_data:
            result["user_id"] = cached_data.get("user_id")
            result["cached_at"] = cached_data.get("cached_at")
    
    return result

