"""
Questions API Routes - Question routing and matching
"""
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import QuestionRequest
from app.services import ai_service, storage

router = APIRouter()


@router.post("/route")
async def route_question(request: QuestionRequest):
    """
    Route a behavioral question to the best matching story
    
    This endpoint:
    1. Analyzes the question to identify competency being assessed
    2. Matches question to best story from user's story bank
    3. Provides reasoning and confidence score
    4. Suggests alternative stories
    """
    try:
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
        
        # Route question using AI
        routing = await ai_service.route_question(
            question=request.question,
            stories=stories,
            context=context or None
        )
        
        return {
            "success": True,
            "routing": routing
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error routing question: {str(e)}"
        )


@router.get("/categories")
async def get_question_categories():
    """Get list of supported question categories"""
    
    categories = [
        {
            "category": "leadership",
            "description": "Questions about leading teams, taking charge, influencing others",
            "examples": [
                "Tell me about a time you led a team",
                "Describe a situation where you had to motivate others"
            ]
        },
        {
            "category": "teamwork",
            "description": "Questions about collaboration and working with others",
            "examples": [
                "Tell me about a time you worked with a difficult team member",
                "Describe your experience working in a team"
            ]
        },
        {
            "category": "conflict",
            "description": "Questions about handling disagreements and difficult situations",
            "examples": [
                "Tell me about a time you had a conflict with a coworker",
                "How do you handle disagreements?"
            ]
        },
        {
            "category": "failure",
            "description": "Questions about mistakes, setbacks, and learning",
            "examples": [
                "Tell me about a time you failed",
                "Describe a mistake you made and what you learned"
            ]
        },
        {
            "category": "problem_solving",
            "description": "Questions about analytical thinking and solutions",
            "examples": [
                "Tell me about a difficult problem you solved",
                "Describe a time you had to think creatively"
            ]
        },
        {
            "category": "communication",
            "description": "Questions about presenting, explaining, or persuading",
            "examples": [
                "Tell me about a time you had to explain something complex",
                "Describe a presentation you gave"
            ]
        }
    ]
    
    return {
        "success": True,
        "categories": categories
    }

