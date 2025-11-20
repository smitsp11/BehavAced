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
        
        # Get resume experiences - try multiple locations for backward compatibility
        experiences = []
        
        # 1. Try new format: resume_analysis.experiences (created after latest fix)
        resume_analysis = profile.get("resume_analysis", {})
        experiences = resume_analysis.get("experiences", [])
        
        # 2. Fallback: build from parsed_resume.work_experience
        if not experiences:
            parsed_resume = profile.get("parsed_resume", {})
            work_experience = parsed_resume.get("work_experience", [])
            
            if work_experience:
                # Transform parsed work experience into the format AI expects
                experiences = []
                for role in work_experience:
                    experience_entry = {
                        "title": role.get("role_title", ""),
                        "company": role.get("company", ""),
                        "date_range": role.get("date_range", ""),
                        "description": role.get("raw_text", ""),
                        "accomplishments": [acc.get("text") for acc in role.get("accomplishments", [])],
                        "quantified_outcomes": role.get("quantified_outcomes", []),
                        "tech_stack": role.get("tech_stack", []),
                        "team_context": role.get("team_context", {}),
                        "kpis": role.get("kpis", [])
                    }
                    experiences.append(experience_entry)
        
        # 3. Last fallback: check if work_experience is stored directly in profile
        if not experiences:
            work_experience = profile.get("work_experience", [])
            if work_experience:
                experiences = []
                for role in work_experience:
                    experience_entry = {
                        "title": role.get("role_title", "") or role.get("title", ""),
                        "company": role.get("company", ""),
                        "date_range": role.get("date_range", ""),
                        "description": role.get("raw_text", "") or role.get("description", ""),
                        "accomplishments": [acc.get("text") if isinstance(acc, dict) else acc 
                                          for acc in role.get("accomplishments", [])],
                        "quantified_outcomes": role.get("quantified_outcomes", []),
                        "tech_stack": role.get("tech_stack", []),
                        "team_context": role.get("team_context", {}),
                        "kpis": role.get("kpis", [])
                    }
                    experiences.append(experience_entry)
        
        if not experiences:
            # Debug: Log what's actually in the profile to diagnose the issue
            debug_info = {
                "profile_keys": list(profile.keys()),
                "has_resume_analysis": "resume_analysis" in profile,
                "has_parsed_resume": "parsed_resume" in profile,
                "has_work_experience": "work_experience" in profile,
            }
            
            # Check what's actually available
            if "parsed_resume" in profile:
                debug_info["parsed_resume_keys"] = list(profile["parsed_resume"].keys()) if profile["parsed_resume"] else []
            if "resume_analysis" in profile:
                debug_info["resume_analysis_keys"] = list(profile["resume_analysis"].keys()) if profile["resume_analysis"] else []
            
            print(f"DEBUG - Profile structure for user {user_id}: {debug_info}")
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No experiences found in profile. Debug info: {debug_info}. Please upload resume first."
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

