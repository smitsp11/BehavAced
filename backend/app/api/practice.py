"""
Practice API Routes - Voice practice and feedback
"""
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import PracticeRequest, PracticeResponse
from app.services import ai_service, storage, voice_service
import uuid

router = APIRouter()


@router.post("/score", response_model=PracticeResponse)
async def score_practice(request: PracticeRequest):
    """
    Score a practice attempt and provide feedback
    
    This endpoint:
    1. Transcribes audio (if provided) or uses provided transcript
    2. Analyzes speech patterns (filler words, pacing)
    3. Scores clarity, structure, confidence
    4. Generates improved version
    5. Provides coaching tips
    """
    try:
        # Get user profile
        profile = storage.get_profile(request.user_id)
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Get or transcribe transcript
        transcript = request.transcript
        
        if not transcript and request.audio_base64:
            # Transcribe audio
            transcription = voice_service.transcribe_audio(
                audio_base64=request.audio_base64,
                audio_format="webm"
            )
            transcript = transcription["transcript"]
        
        if not transcript:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either transcript or audio must be provided"
            )
        
        # Analyze speech patterns
        speech_analysis = voice_service.analyze_speech_patterns(transcript)
        
        # Route question to get expected story
        stories = storage.get_stories(request.user_id)
        routing = await ai_service.route_question(
            question=request.question,
            stories=stories,
            context=None
        )
        
        # Get matched story
        matched_story = None
        for story in stories:
            if story.get("story_id") == routing["matched_story_id"]:
                matched_story = story
                break
        
        # Get personality profile
        personality_profile = {
            "personality_traits": profile.get("personality_traits", []),
            "communication_style": profile.get("communication_style", {}),
            "strengths": profile.get("strengths", [])
        }
        
        # Score the attempt using AI
        scoring = await ai_service.score_practice_attempt(
            question=request.question,
            transcript=transcript,
            expected_story=matched_story or {},
            personality_profile=personality_profile
        )
        
        # Generate improved version
        improvement = await ai_service.improve_answer(
            original_transcript=transcript,
            feedback=scoring,
            personality_profile=personality_profile
        )
        
        # Create attempt record
        attempt_id = str(uuid.uuid4())
        attempt_data = {
            "attempt_id": attempt_id,
            "question": request.question,
            "transcript": transcript,
            "audio_duration_seconds": request.duration_seconds,
            "scores": scoring.get("scores", {}),
            "filler_analysis": speech_analysis,
            "overall_analysis": scoring
        }
        
        # Save attempt
        storage.save_attempt(request.user_id, attempt_data)
        
        # Build response
        scores = scoring.get("scores", {})
        
        return PracticeResponse(
            success=True,
            attempt={
                "attempt_id": attempt_id,
                "question": request.question,
                "transcript": transcript,
                "audio_duration_seconds": request.duration_seconds,
                
                "clarity_score": scores.get("clarity_score", 75),
                "structure_score": scores.get("structure_score", 75),
                "confidence_score": scores.get("confidence_score", 75),
                "pacing_score": scores.get("pacing_score", 75),
                "overall_score": scores.get("overall_score", 75),
                
                "filler_words_count": speech_analysis.get("total_filler_count", 0),
                "filler_words": speech_analysis.get("filler_words", {}),
                "missing_elements": scoring.get("structure_analysis", {}).get("missing_elements", []),
                "strengths": scoring.get("strengths", []),
                "improvements": [imp["area"] for imp in scoring.get("improvements", [])],
                
                "created_at": attempt_data.get("created_at")
            },
            improved_answer={
                "original_transcript": transcript,
                "improved_version": improvement.get("improved_answer", ""),
                "changes_made": improvement.get("changes_made", []),
                "coaching_tips": improvement.get("coaching_tips", [])
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error scoring practice: {str(e)}"
        )


@router.get("/history/{user_id}")
async def get_practice_history(user_id: str, limit: int = 10):
    """Get user's practice history"""
    
    if not storage.user_exists(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    attempts = storage.get_attempts(user_id, limit=limit)
    
    return {
        "success": True,
        "user_id": user_id,
        "attempts": attempts,
        "total_count": len(attempts)
    }

