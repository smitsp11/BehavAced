"""
Profile Vault API Routes
Simple onboarding flow that saves user inputs to Supabase
Processing happens later (cost-efficient approach)
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import (
    create_user_profile,
    update_user_profile,
    get_user_profile,
    create_story,
    get_user_stories,
    mark_profile_processed
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================
# Request/Response Models
# ============================================

class OnboardingRequest(BaseModel):
    """Initial onboarding data from frontend"""
    work_style: Optional[str] = None  # "I am analytical..."
    communication_style: Optional[str] = None  # "I am direct..."
    raw_resume_text: Optional[str] = None  # The full resume text blob
    
    class Config:
        json_schema_extra = {
            "example": {
                "work_style": "I am analytical and detail-oriented. I prefer to understand the full picture before making decisions.",
                "communication_style": "I am direct but empathetic. I believe in clear, honest feedback.",
                "raw_resume_text": "JOHN DOE\nSoftware Engineer\n\nEXPERIENCE:\n- Led a team of 5 engineers..."
            }
        }


class OnboardingResponse(BaseModel):
    """Response after successful onboarding"""
    success: bool
    profile_id: str
    message: str


class ProfileUpdateRequest(BaseModel):
    """Update specific fields of a profile"""
    work_style: Optional[str] = None
    communication_style: Optional[str] = None
    raw_resume_text: Optional[str] = None


class StoryCreateRequest(BaseModel):
    """Create a story linked to a user profile"""
    user_id: str
    title: str
    star_response: dict  # {S: "...", T: "...", A: "...", R: "..."}
    tags: List[str]  # ["Leadership", "Conflict"]


# ============================================
# Endpoints
# ============================================

@router.post("/onboarding", response_model=OnboardingResponse)
async def create_profile_vault(request: OnboardingRequest):
    """
    Create a new user profile (Profile Vault)
    
    This is the main onboarding endpoint. It captures:
    - work_style: How the user describes their work approach
    - communication_style: How they describe their communication
    - raw_resume_text: The raw text from their uploaded resume
    
    The profile is saved with is_processed=False.
    A background job can later process these for story extraction.
    """
    try:
        profile_id = create_user_profile(
            work_style=request.work_style,
            communication_style=request.communication_style,
            raw_resume_text=request.raw_resume_text
        )
        
        if not profile_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user profile"
            )
        
        logger.info(f"✓ Profile Vault created: {profile_id}")
        
        return OnboardingResponse(
            success=True,
            profile_id=profile_id,
            message="Profile created successfully. Ready for processing."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Onboarding error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating profile: {str(e)}"
        )


@router.get("/profile/{profile_id}")
async def get_profile(profile_id: str):
    """
    Get a user profile by ID
    """
    profile = get_user_profile(profile_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return {
        "success": True,
        "profile": profile
    }


@router.patch("/profile/{profile_id}")
async def update_profile(profile_id: str, request: ProfileUpdateRequest):
    """
    Update a user profile
    Only updates fields that are provided (non-None)
    """
    # Build update data, excluding None values
    update_data = {}
    if request.work_style is not None:
        update_data["work_style"] = request.work_style
    if request.communication_style is not None:
        update_data["communication_style"] = request.communication_style
    if request.raw_resume_text is not None:
        update_data["raw_resume_text"] = request.raw_resume_text
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    success = update_user_profile(profile_id, update_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
    
    return {
        "success": True,
        "message": "Profile updated successfully"
    }


@router.post("/profile/{profile_id}/stories")
async def add_story(profile_id: str, request: StoryCreateRequest):
    """
    Add a story to a user's profile
    
    The star_response should be a dict with keys: S, T, A, R
    """
    # Verify profile exists
    profile = get_user_profile(profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    story_id = create_story(
        user_id=profile_id,
        title=request.title,
        star_response=request.star_response,
        tags=request.tags
    )
    
    if not story_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create story"
        )
    
    return {
        "success": True,
        "story_id": story_id,
        "message": "Story created successfully"
    }


@router.get("/profile/{profile_id}/stories")
async def get_profile_stories(profile_id: str):
    """
    Get all stories for a user profile
    """
    # Verify profile exists
    profile = get_user_profile(profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    stories = get_user_stories(profile_id)
    
    return {
        "success": True,
        "count": len(stories),
        "stories": stories
    }


@router.post("/profile/{profile_id}/process")
async def trigger_processing(profile_id: str):
    """
    Mark a profile as processed
    
    In a full implementation, this would trigger AI processing
    to extract stories from the resume text.
    """
    # Verify profile exists
    profile = get_user_profile(profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    if profile.get("is_processed"):
        return {
            "success": True,
            "message": "Profile already processed",
            "processed_at": profile.get("processed_at")
        }
    
    # Mark as processed (in real implementation, this would trigger AI)
    success = mark_profile_processed(profile_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark profile as processed"
        )
    
    return {
        "success": True,
        "message": "Profile marked as processed"
    }


@router.get("/health")
async def vault_health():
    """
    Health check for Profile Vault
    """
    from app.core.database import check_database_connection
    
    db_status = check_database_connection()
    
    return {
        "status": "healthy" if db_status["status"] == "connected" else "degraded",
        "database": db_status
    }

