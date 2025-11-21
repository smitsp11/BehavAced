"""
Onboarding API Routes - Personality and manual experience processing
"""
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    PersonalitySnapshotRequest,
    PersonalitySnapshotResponse,
    ManualExperienceRequest,
    ManualExperienceResponse
)
from app.services import mvp_service, storage

router = APIRouter()


@router.post("/personality", response_model=PersonalitySnapshotResponse)
async def create_personality_snapshot(request: PersonalitySnapshotRequest):
    """
    Create personality snapshot and embedding

    This endpoint analyzes personality questionnaire responses and writing samples
    to create a comprehensive personality profile with communication style preferences.
    """
    try:
        snapshot = await mvp_service.create_personality_snapshot(
            user_id=request.user_id,
            responses=request.responses,
            writing_sample=request.writing_sample
        )

        # Save to user profile
        profile = storage.get_profile(request.user_id) or {}
        profile["personality_snapshot"] = snapshot.dict()
        storage.save_profile(request.user_id, profile)

        return PersonalitySnapshotResponse(
            success=True,
            user_id=request.user_id,
            snapshot=snapshot,
            message="Personality snapshot created successfully"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating personality snapshot: {str(e)}"
        )


@router.post("/manual-experience", response_model=ManualExperienceResponse)
async def process_manual_experience(request: ManualExperienceRequest):
    """
    Process manually entered work experience

    This endpoint analyzes manually entered work experiences and extracts
    behavioral interview stories and skill assessments.
    """
    try:
        result = await mvp_service.process_manual_experience(
            user_id=request.user_id,
            experiences=[exp.dict() for exp in request.experiences],
            education=request.education,
            additional_skills=request.additional_skills
        )

        # Save processed experience to profile
        profile = storage.get_profile(request.user_id) or {}
        profile["manual_experience"] = result
        storage.save_profile(request.user_id, profile)

        # Save extracted stories
        storage.save_stories(request.user_id, result["extracted_stories"])

        return ManualExperienceResponse(
            success=True,
            user_id=request.user_id,
            processed_experiences=result["processed_experiences"],
            extracted_stories=result["extracted_stories"],
            message=f"Processed {len(request.experiences)} experiences and extracted {len(result['extracted_stories'])} story candidates"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing manual experience: {str(e)}"
        )
