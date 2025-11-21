"""
Personalized Answers API Routes - Generate tailored behavioral interview answers
"""
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import PersonalizedAnswerRequest, PersonalizedAnswerResponse
from app.services import mvp_service

router = APIRouter()


@router.post("/personalized", response_model=PersonalizedAnswerResponse)
async def generate_personalized_answer(request: PersonalizedAnswerRequest):
    """
    Generate personalized behavioral interview answer

    This endpoint creates tailored answers using the user's personality profile,
    communication style, and story bank for authentic, personalized responses.
    """
    try:
        result = await mvp_service.generate_personalized_answer(
            user_id=request.user_id,
            question=request.question,
            company_context=request.company_context,
            role_context=request.role_context
        )

        return PersonalizedAnswerResponse(
            success=True,
            routing=result["routing"],
            answer=result["answer"],
            tone_match_score=result["tone_match_score"],
            personalization_factors=result["personalization_factors"]
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating personalized answer: {str(e)}"
        )
