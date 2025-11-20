"""
Profile API Routes - User onboarding and profile creation
"""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    ResumeUploadRequest,
    PersonalityQuestionnaireRequest,
    ProfileResponse,
    UserProfile,
    CommunicationStyle
)
from app.services import ai_service, file_service, storage
from app.services.resume_parser import resume_parser
import uuid

router = APIRouter()


@router.post("/ingest", response_model=ProfileResponse)
async def ingest_profile(request: ResumeUploadRequest):
    """
    Ingest resume and create initial user profile
    
    This endpoint:
    1. Extracts text from uploaded resume
    2. Parses resume using traditional NLP (no LLM)
    3. Extracts structured data: roles, accomplishments, skills, achievements
    4. Creates initial user profile
    5. Returns user_id for subsequent requests
    
    Focus: Extract narrative spine elements for behavioral interviews:
    - Role context (team size, scope, KPIs)
    - Quantified accomplishments
    - Tech stack and skills
    - Notable achievements
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
        
        # Parse resume using traditional NLP (no LLM)
        parsed_resume = resume_parser.parse(resume_text)
        
        # Create user ID
        user_id = storage.create_user_id()
        
        # Determine experience level from last role
        last_role = parsed_resume.get("last_role", {})
        experience_level = "entry"
        if last_role:
            role_title_lower = last_role.get("role_title", "").lower()
            if any(term in role_title_lower for term in ["senior", "lead", "principal", "director"]):
                experience_level = "senior"
            elif any(term in role_title_lower for term in ["mid", "intermediate"]):
                experience_level = "mid"
            elif "intern" in role_title_lower:
                experience_level = "student"
        
        # Extract strengths from accomplishments and achievements
        strengths = []
        for role in parsed_resume.get("work_experience", []):
            if role.get("personal_contributions"):
                strengths.append(f"Strong {role.get('role_title', 'contributions')}")
            if role.get("quantified_outcomes"):
                strengths.append("Results-driven with measurable impact")
        
        # Create initial profile (will be completed with personality questionnaire)
        profile_data = {
            "user_id": user_id,
            "resume_text": resume_text,
            "parsed_resume": parsed_resume,
            "headline": parsed_resume.get("headline", {}),
            "last_role": last_role,
            "work_experience": parsed_resume.get("work_experience", []),
            "skills": parsed_resume.get("skills", {}),
            "education": parsed_resume.get("education", {}),
            "achievements": parsed_resume.get("achievements", []),
            "embeddings": parsed_resume.get("embeddings", {}),
            "experience_level": experience_level,
            "profile_complete": False,
            "created_at": datetime.now(timezone.utc),
        }
        
        # Save profile
        storage.save_profile(user_id, profile_data)
        
        # Save extracted work experiences as potential story candidates
        # These will be used later for story generation (with LLM) or semantic matching
        story_candidates = []
        for role in parsed_resume.get("work_experience", []):
            for acc in role.get("accomplishments", []):
                if acc.get("has_quantifier") or acc.get("is_personal_contribution"):
                    story_candidates.append({
                        "role_title": role.get("role_title"),
                        "company": role.get("company"),
                        "accomplishment": acc.get("text"),
                        "quantified": acc.get("has_quantifier"),
                        "tech_used": role.get("tech_stack", []),
                        "kpis": role.get("kpis", [])
                    })
        
        storage.save_stories(user_id, story_candidates)
        
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
                "strengths": strengths[:5] if strengths else ["Strong work experience"],
                "weaknesses": [],
                "confidence_level": 5,
                "experience_level": experience_level,
                "created_at": profile_data.get("created_at")
            },
            message=f"Resume parsed successfully. Found {len(parsed_resume.get('work_experience', []))} roles and {len(story_candidates)} story candidates."
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

