"""
Answers API Routes - Answer generation
"""
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import QuestionRequest, AnswerResponse
from app.services import ai_service, storage

router = APIRouter()


@router.post("/generate", response_model=AnswerResponse)
async def generate_answer(request: QuestionRequest):
    """
    Generate a personalized answer to a behavioral question
    
    This endpoint:
    1. Routes the question to best story
    2. Gets user's communication style
    3. Generates answer in user's authentic voice
    4. Returns structured answer with metadata
    """
    try:
        # Get user profile
        profile = storage.get_profile(request.user_id)
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Get user's stories
        stories = storage.get_stories(request.user_id)
        
        if not stories:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No stories found. Please generate stories first."
            )
        
        # Build context
        context = ""
        if request.company_context:
            context += f"Company: {request.company_context}\n"
        if request.role_context:
            context += f"Role: {request.role_context}\n"
        
        # Route question to best story
        routing = await ai_service.route_question(
            question=request.question,
            stories=stories,
            context=context or None
        )
        
        # Get the matched story
        matched_story = None
        for story in stories:
            if story.get("story_id") == routing["matched_story_id"]:
                matched_story = story
                break
        
        if not matched_story:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Matched story not found"
            )
        
        # Get personality profile
        personality_profile = {
            "personality_traits": profile.get("personality_traits", []),
            "communication_style": profile.get("communication_style", {}),
            "strengths": profile.get("strengths", []),
            "linguistic_patterns": profile.get("personality_analysis", {}).get("linguistic_patterns", {})
        }
        
        # Generate answer
        answer_data = await ai_service.generate_answer(
            question=request.question,
            story=matched_story,
            personality_profile=personality_profile,
            context=context or None
        )
        
        return AnswerResponse(
            success=True,
            routing={
                "question": request.question,
                "detected_category": routing.get("detected_category"),
                "matched_story_id": routing.get("matched_story_id"),
                "match_confidence": routing.get("match_confidence", 0.9),
                "reasoning": routing.get("match_reasoning", ""),
                "alternative_stories": routing.get("alternative_stories")
            },
            answer={
                "question": request.question,
                "story_id": matched_story["story_id"],
                "answer_text": answer_data.get("answer_text"),
                "structure": answer_data.get("structure", "STAR"),
                "estimated_time_seconds": answer_data.get("estimated_time_seconds", 90),
                "key_points": answer_data.get("key_points", []),
                "tone_match": answer_data.get("tone_match_score", 0.9)
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating answer: {str(e)}"
        )

