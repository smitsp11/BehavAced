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
    CommunicationStyle,
    PersonalityTraits
)
from app.services import ai_service, file_service, storage
from app.services.resume_parser import resume_parser
from app.core.config import settings
import uuid

router = APIRouter()


def normalize_personality_traits(ai_traits: list) -> list:
    """
    Normalize AI-returned personality traits to match PersonalityTraits enum values.
    
    Maps synonyms and variations to the allowed enum values:
    - analytical, creative, detail_oriented, big_picture
    - collaborative, independent, assertive, diplomatic
    """
    if not ai_traits:
        return []
    
    # Mapping from common AI outputs to enum values
    trait_mapping = {
        # Analytical variations
        "analytical": PersonalityTraits.ANALYTICAL,
        "analytical thinker": PersonalityTraits.ANALYTICAL,
        "logical": PersonalityTraits.ANALYTICAL,
        "data-driven": PersonalityTraits.ANALYTICAL,
        "systematic": PersonalityTraits.ANALYTICAL,
        
        # Creative variations
        "creative": PersonalityTraits.CREATIVE,
        "innovative": PersonalityTraits.CREATIVE,
        "imaginative": PersonalityTraits.CREATIVE,
        
        # Detail-oriented variations
        "detail_oriented": PersonalityTraits.DETAIL_ORIENTED,
        "detail-oriented": PersonalityTraits.DETAIL_ORIENTED,
        "detail oriented": PersonalityTraits.DETAIL_ORIENTED,
        "meticulous": PersonalityTraits.DETAIL_ORIENTED,
        "thorough": PersonalityTraits.DETAIL_ORIENTED,
        "precise": PersonalityTraits.DETAIL_ORIENTED,
        
        # Big picture variations
        "big_picture": PersonalityTraits.BIG_PICTURE,
        "big-picture": PersonalityTraits.BIG_PICTURE,
        "big picture": PersonalityTraits.BIG_PICTURE,
        "strategic": PersonalityTraits.BIG_PICTURE,
        "visionary": PersonalityTraits.BIG_PICTURE,
        "holistic": PersonalityTraits.BIG_PICTURE,
        
        # Collaborative variations
        "collaborative": PersonalityTraits.COLLABORATIVE,
        "team player": PersonalityTraits.COLLABORATIVE,
        "team-oriented": PersonalityTraits.COLLABORATIVE,
        "cooperative": PersonalityTraits.COLLABORATIVE,
        
        # Independent variations
        "independent": PersonalityTraits.INDEPENDENT,
        "self-directed": PersonalityTraits.INDEPENDENT,
        "autonomous": PersonalityTraits.INDEPENDENT,
        "self-reliant": PersonalityTraits.INDEPENDENT,
        
        # Assertive variations
        "assertive": PersonalityTraits.ASSERTIVE,
        "confident": PersonalityTraits.ASSERTIVE,
        "decisive": PersonalityTraits.ASSERTIVE,
        "direct": PersonalityTraits.ASSERTIVE,
        
        # Diplomatic variations
        "diplomatic": PersonalityTraits.DIPLOMATIC,
        "tactful": PersonalityTraits.DIPLOMATIC,
        "considerate": PersonalityTraits.DIPLOMATIC,
        "empathetic": PersonalityTraits.DIPLOMATIC,
        "sensitive": PersonalityTraits.DIPLOMATIC,
    }
    
    normalized = []
    seen = set()
    
    for trait in ai_traits:
        if not trait:
            continue
        
        # Normalize: lowercase, strip whitespace
        trait_lower = str(trait).lower().strip()
        
        # Try direct match first
        if trait_lower in trait_mapping:
            enum_value = trait_mapping[trait_lower]
            if enum_value not in seen:
                normalized.append(enum_value)
                seen.add(enum_value)
            continue
        
        # Try partial matching (e.g., "detail-oriented person" -> "detail-oriented")
        for key, enum_value in trait_mapping.items():
            if key in trait_lower or trait_lower in key:
                if enum_value not in seen:
                    normalized.append(enum_value)
                    seen.add(enum_value)
                break
    
    # If no matches found, return empty list (or could default to a subset)
    # For now, return empty to avoid validation errors
    return normalized


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
        
        # Parse resume using traditional NLP for embeddings and detailed structure
        parsed_resume = resume_parser.parse(resume_text)
        
        # Use AI to analyze resume and create structured experiences for story generation
        # This produces the format expected by ai_service.extract_stories()
        resume_analysis = await ai_service.analyze_resume(resume_text)
        
        # Create user ID
        user_id = storage.create_user_id()
        
        # Get experience level from AI analysis (fallback to NLP if needed)
        experience_level = resume_analysis.get("candidate_summary", {}).get("experience_level", "entry")
        if not experience_level or experience_level == "entry":
            # Fallback: determine from last role in parsed data
            last_role = parsed_resume.get("last_role", {})
            if last_role:
                role_title_lower = last_role.get("role_title", "").lower()
                if any(term in role_title_lower for term in ["senior", "lead", "principal", "director"]):
                    experience_level = "senior"
                elif any(term in role_title_lower for term in ["mid", "intermediate"]):
                    experience_level = "mid"
                elif "intern" in role_title_lower:
                    experience_level = "student"
        
        # Extract strengths from AI analysis
        strengths = resume_analysis.get("candidate_summary", {}).get("key_strengths", [])
        
        # Keep last_role from NLP parsing for reference
        last_role = parsed_resume.get("last_role", {})
        
        # Create initial profile (will be completed with personality questionnaire)
        profile_data = {
            "user_id": user_id,
            "resume_text": resume_text,
            "parsed_resume": parsed_resume,
            "resume_analysis": resume_analysis,  # Add for story generation compatibility
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
        
        # Auto-save to cache in dev mode (after resume upload and stories saved)
        if settings.ENVIRONMENT == "development":
            storage.save_cached_profile(user_id)
        
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
        
        # Ensure created_at exists (use existing or create new)
        if "created_at" not in profile_data or profile_data.get("created_at") is None:
            profile_data["created_at"] = datetime.now(timezone.utc)
        
        # Normalize personality traits to enum values
        ai_traits = personality_analysis.get("personality_traits", [])
        normalized_traits = normalize_personality_traits(ai_traits)
        
        # Update with personality data
        profile_data.update({
            "user_id": user_id,
            "personality_analysis": personality_analysis,
            "personality_traits": normalized_traits,  # Use normalized traits
            "communication_style": personality_analysis.get("communication_style", {}),
            "strengths": personality_analysis.get("strengths", []),
            "weaknesses": personality_analysis.get("weaknesses", []),
            "confidence_level": personality_analysis.get("confidence_level", 5),
            "profile_complete": True
        })
        
        storage.save_profile(user_id, profile_data)
        
        # Auto-save to cache in dev mode
        if settings.ENVIRONMENT == "development":
            storage.save_cached_profile(user_id)
        
        return ProfileResponse(
            success=True,
            user_id=user_id,
            profile={
                "user_id": user_id,
                "personality_traits": normalized_traits,  # Use normalized traits
                "communication_style": profile_data.get("communication_style", {}),
                "strengths": profile_data.get("strengths", []),
                "weaknesses": profile_data.get("weaknesses", []),
                "confidence_level": profile_data.get("confidence_level", 5),
                "experience_level": profile_data.get("experience_level", "entry"),
                "created_at": profile_data.get("created_at")  # Now guaranteed to exist
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
    
    # Ensure created_at exists (should already be set, but handle edge case)
    if "created_at" not in profile_data or profile_data.get("created_at") is None:
        profile_data["created_at"] = datetime.now(timezone.utc)
        storage.save_profile(user_id, profile_data)
    
    # Normalize personality traits if they exist (in case they were stored as strings)
    personality_traits = profile_data.get("personality_traits", [])
    if personality_traits and isinstance(personality_traits[0], str):
        personality_traits = normalize_personality_traits(personality_traits)
    
    return ProfileResponse(
        success=True,
        user_id=user_id,
        profile={
            "user_id": user_id,
            "personality_traits": personality_traits,
            "communication_style": profile_data.get("communication_style", {}),
            "strengths": profile_data.get("strengths", []),
            "weaknesses": profile_data.get("weaknesses", []),
            "confidence_level": profile_data.get("confidence_level", 5),
            "experience_level": profile_data.get("experience_level", "entry"),
            "created_at": profile_data.get("created_at")
        },
        message="Profile retrieved successfully"
    )

