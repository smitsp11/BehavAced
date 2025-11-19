"""
Stories API Routes - Story extraction and management
"""
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import StoriesResponse, Story
from app.services import ai_service, storage
from typing import List
import uuid

router = APIRouter()


@router.post("/generate/{user_id}", response_model=StoriesResponse)
async def generate_stories(user_id: str):
    """
    Generate behavioral interview stories from user's experiences
    
    This endpoint:
    1. Gets user profile and resume experiences
    2. Uses AI to transform experiences into structured stories
    3. Creates multiple versions (STAR, SOAR, compressed, detailed)
    4. Saves stories to user's story bank
    """
    try:
        # Get user profile
        profile = storage.get_profile(user_id)
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Get resume experiences
        resume_analysis = profile.get("resume_analysis", {})
        experiences = resume_analysis.get("experiences", [])
        
        if not experiences:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No experiences found in profile. Please upload resume first."
            )
        
        # Get personality profile for voice matching
        personality_profile = {
            "personality_traits": profile.get("personality_traits", []),
            "communication_style": profile.get("communication_style", {}),
            "strengths": profile.get("strengths", [])
        }
        
        # Extract stories using AI
        stories = await ai_service.extract_stories(
            resume_experiences=experiences,
            personality_profile=personality_profile
        )
        
        # Add unique IDs to stories
        for story in stories:
            if "story_id" not in story:
                story["story_id"] = str(uuid.uuid4())
        
        # Save stories
        storage.save_stories(user_id, stories)
        
        return StoriesResponse(
            success=True,
            user_id=user_id,
            stories=stories,
            total_count=len(stories)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating stories: {str(e)}"
        )


@router.get("/{user_id}", response_model=StoriesResponse)
async def get_stories(user_id: str):
    """Get all stories for a user"""
    
    if not storage.user_exists(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    stories = storage.get_stories(user_id)
    
    return StoriesResponse(
        success=True,
        user_id=user_id,
        stories=stories,
        total_count=len(stories)
    )


@router.get("/{user_id}/{story_id}")
async def get_story(user_id: str, story_id: str):
    """Get a specific story"""
    
    story = storage.get_story(user_id, story_id)
    
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Story not found"
        )
    
    return {
        "success": True,
        "story": story
    }

