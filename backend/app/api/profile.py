"""
Profile API Routes - User onboarding and profile creation
"""
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    ResumeUploadRequest,
    PersonalityQuestionnaireRequest,
    ProfileResponse,
    UserProfile,
    CommunicationStyle
)
from app.services import ai_service, file_service, storage
import uuid

router = APIRouter()


@router.post("/ingest", response_model=ProfileResponse)
async def ingest_profile(request: ResumeUploadRequest):
    """
    Ingest resume and create initial user profile
    
    This endpoint:
    1. Extracts text from uploaded resume
    2. Analyzes resume using AI
    3. Creates initial user profile
    4. Returns user_id for subsequent requests
    """
    try:
        # Extract text from resume
        resume_text = file_service.process_resume(
            file_content=request.file_content,
            file_type=request.file_type
        )
        
        if not resume_text or len(resume_text) < 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Resume text is too short or could not be extracted"
            )
        
        # Analyze resume with AI
        resume_analysis = await ai_service.analyze_resume(resume_text)
        
        # Create user ID
        user_id = storage.create_user_id()
        
        # Create initial profile (will be completed with personality questionnaire)
        profile_data = {
            "user_id": user_id,
            "resume_text": resume_text,
            "resume_analysis": resume_analysis,
            "experience_level": resume_analysis.get("candidate_summary", {}).get("experience_level", "entry"),
            "profile_complete": False
        }
        
        # Save profile
        storage.save_profile(user_id, profile_data)
        
        # Save extracted experiences as potential stories
        experiences = resume_analysis.get("experiences", [])
        storage.save_stories(user_id, experiences)
        
        return ProfileResponse(
            success=True,
            user_id=user_id,
            profile={
                "user_id": user_id,
                "personality_traits": [],
                "communication_style": {
                    "vocabulary_level": "moderate",
                    "sentence_complexity": "medium",
                    "tone": "conversational",
                    "pace": "moderate",
                    "detail_preference": "balanced",
                    "storytelling_style": "narrative"
                },
                "strengths": resume_analysis.get("candidate_summary", {}).get("key_strengths", []),
                "weaknesses": [],
                "confidence_level": 5,
                "experience_level": profile_data["experience_level"],
                "created_at": profile_data.get("created_at")
            },
            message=f"Resume analyzed successfully. Found {len(experiences)} potential stories."
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing resume: {str(e)}"
        )


@router.post("/personality", response_model=ProfileResponse)
async def analyze_personality(request: PersonalityQuestionnaireRequest):
    """
    Analyze personality and communication style
    
    This completes the user profile with:
    1. Personality traits
    2. Communication style analysis
    3. Strengths and weaknesses
    """
    try:
        # For MVP, we'll use a simple approach
        # In production, user_id would come from auth token
        
        # Analyze personality with AI
        personality_analysis = await ai_service.analyze_personality(
            questionnaire_responses=request.responses,
            writing_sample=request.writing_sample
        )
        
        # Create or update profile
        # For demo, create new user if needed
        user_id = request.responses.get("user_id") or storage.create_user_id()
        
        profile_data = storage.get_profile(user_id) or {}
        
        # Update with personality data
        profile_data.update({
            "user_id": user_id,
            "personality_analysis": personality_analysis,
            "personality_traits": personality_analysis.get("personality_traits", []),
            "communication_style": personality_analysis.get("communication_style", {}),
            "strengths": personality_analysis.get("strengths", []),
            "weaknesses": personality_analysis.get("weaknesses", []),
            "confidence_level": personality_analysis.get("confidence_level", 5),
            "profile_complete": True
        })
        
        storage.save_profile(user_id, profile_data)
        
        return ProfileResponse(
            success=True,
            user_id=user_id,
            profile={
                "user_id": user_id,
                "personality_traits": profile_data.get("personality_traits", []),
                "communication_style": profile_data.get("communication_style", {}),
                "strengths": profile_data.get("strengths", []),
                "weaknesses": profile_data.get("weaknesses", []),
                "confidence_level": profile_data.get("confidence_level", 5),
                "experience_level": profile_data.get("experience_level", "entry"),
                "created_at": profile_data.get("created_at")
            },
            message="Personality profile created successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing personality: {str(e)}"
        )


@router.get("/{user_id}", response_model=ProfileResponse)
async def get_profile(user_id: str):
    """Get user profile"""
    
    profile_data = storage.get_profile(user_id)
    
    if not profile_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return ProfileResponse(
        success=True,
        user_id=user_id,
        profile={
            "user_id": user_id,
            "personality_traits": profile_data.get("personality_traits", []),
            "communication_style": profile_data.get("communication_style", {}),
            "strengths": profile_data.get("strengths", []),
            "weaknesses": profile_data.get("weaknesses", []),
            "confidence_level": profile_data.get("confidence_level", 5),
            "experience_level": profile_data.get("experience_level", "entry"),
            "created_at": profile_data.get("created_at")
        },
        message="Profile retrieved successfully"
    )

