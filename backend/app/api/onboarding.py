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
from app.services import mvp_service, storage, voice_service

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


@router.post("/voice")
async def upload_voice_sample(request: dict):
    """
    Upload voice sample for analysis (stub implementation)

    This endpoint accepts voice samples for future tone and speaking style analysis.
    Currently returns a success response for compatibility.
    """
    try:
        user_id = request.get("user_id")
        audio_base64 = request.get("audio_base64")
        duration_seconds = request.get("duration_seconds", 0)

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="user_id is required"
            )

        # For now, just acknowledge the upload
        # Future: Implement actual voice analysis
        if audio_base64:
            try:
                # Could validate base64 format here
                # transcription = voice_service.transcribe_audio(audio_base64)
                pass
            except Exception as e:
                # Log but don't fail - voice is optional
                print(f"Voice processing failed (non-critical): {e}")

        # Store voice upload metadata
        profile = storage.get_profile(user_id) or {}
        profile["voice_sample"] = {
            "uploaded_at": datetime.now().isoformat(),
            "duration_seconds": duration_seconds,
            "processed": False  # Future: set to True when analysis is implemented
        }
        storage.save_profile(user_id, profile)

        return {
            "success": True,
            "message": "Voice sample uploaded successfully",
            "note": "Voice analysis features coming soon"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading voice sample: {str(e)}"
        )
