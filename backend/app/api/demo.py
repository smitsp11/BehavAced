"""
Demo API Routes - Non-personalized behavioral interview answers
"""
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import DemoAnswerRequest, DemoAnswerResponse
from app.services import mvp_service

router = APIRouter()


@router.post("/answer", response_model=DemoAnswerResponse)
async def generate_demo_answer(request: DemoAnswerRequest):
    """
    Generate a demo behavioral interview answer (non-personalized)

    This endpoint provides high-quality example answers that demonstrate
    best practices for behavioral interviews, without requiring user profiles.
    """
    try:
        answer_data = await mvp_service.generate_demo_answer(
            question=request.question,
            company_context=request.company_context,
            role_context=request.role_context,
            industry=request.industry
        )

        return DemoAnswerResponse(
            success=True,
            answer=answer_data["answer"],
            structure=answer_data["structure"],
            key_points=answer_data["key_points"],
            estimated_time_seconds=answer_data["estimated_time_seconds"]
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating demo answer: {str(e)}"
        )
