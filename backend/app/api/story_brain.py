"""
Story Brain API Routes - Generate clustered story banks
"""
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import StoryBrainGenerateRequest, StoryBrainResponse
from app.services import mvp_service, storage

router = APIRouter()


@router.post("/generate", response_model=StoryBrainResponse)
async def generate_story_brain(request: StoryBrainGenerateRequest):
    """
    Generate clustered story bank (story-brain)

    This endpoint analyzes all user stories and creates thematic clusters
    organized by competency and behavioral interview relevance.
    """
    try:
        story_brain = await mvp_service.generate_story_brain(request.user_id)

        # Save story brain to user profile
        profile = storage.get_profile(request.user_id) or {}
        profile["story_brain"] = story_brain.dict()
        storage.save_profile(request.user_id, profile)

        return StoryBrainResponse(
            success=True,
            story_brain=story_brain,
            message=f"Generated story brain with {len(story_brain.clusters)} clusters from {story_brain.total_stories} stories"
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating story brain: {str(e)}"
        )
