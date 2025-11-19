"""
Plans API Routes - Practice plan generation
"""
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import PlanRequest, PlanResponse
from app.services import ai_service, storage

router = APIRouter()


@router.post("/generate", response_model=PlanResponse)
async def generate_plan(request: PlanRequest):
    """
    Generate personalized practice plan
    
    This endpoint:
    1. Analyzes user's profile and weaknesses
    2. Reviews past practice attempts
    3. Creates adaptive plan targeting weak areas
    4. Schedules story practice with spaced repetition
    """
    try:
        # Get user profile
        profile = storage.get_profile(request.user_id)
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Get stories
        stories = storage.get_stories(request.user_id)
        
        if not stories:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No stories found. Please generate stories first."
            )
        
        # Get past attempts for weakness analysis
        attempts = storage.get_attempts(request.user_id, limit=20)
        
        # Build user profile for planning
        user_profile = {
            "user_id": request.user_id,
            "experience_level": profile.get("experience_level", "entry"),
            "strengths": profile.get("strengths", []),
            "weaknesses": profile.get("weaknesses", []),
            "confidence_level": profile.get("confidence_level", 5),
            "communication_style": profile.get("communication_style", {})
        }
        
        # Generate plan using AI
        plan_data = await ai_service.generate_practice_plan(
            user_profile=user_profile,
            stories=stories,
            past_attempts=attempts,
            duration_days=request.duration_days
        )
        
        # Save plan
        storage.save_plan(request.user_id, plan_data)
        
        return PlanResponse(
            success=True,
            plan={
                "plan_id": plan_data.get("plan_id", ""),
                "user_id": request.user_id,
                "duration_days": request.duration_days,
                "daily_tasks": plan_data.get("daily_tasks", []),
                "focus_areas": plan_data.get("plan_summary", {}).get("focus_areas", []),
                "target_competencies": plan_data.get("plan_summary", {}).get("target_competencies", []),
                "stories_to_strengthen": list(plan_data.get("stories_practice_schedule", {}).keys()),
                "created_at": plan_data.get("created_at")
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating plan: {str(e)}"
        )


@router.get("/{user_id}")
async def get_plan(user_id: str):
    """Get user's current practice plan"""
    
    plan = storage.get_plan(user_id)
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No practice plan found"
        )
    
    return {
        "success": True,
        "plan": plan
    }


@router.post("/{user_id}/progress")
async def update_progress(user_id: str, day: int, task_index: int, completed: bool):
    """Update progress on a plan task"""
    
    success = storage.update_plan_progress(user_id, day, task_index, completed)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    
    return {
        "success": True,
        "message": "Progress updated"
    }

