"""
Profile Engine - Async Profile Building with Background Tasks
Fire-and-Forget architecture for instant UX
"""
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing import Optional
import google.generativeai as genai
import json
import logging
from datetime import datetime

from app.core.config import settings
from app.core.database import get_supabase

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize Gemini
if settings.GOOGLE_API_KEY:
    genai.configure(api_key=settings.GOOGLE_API_KEY)


# ============================================
# Data Models
# ============================================

class ProfileInput(BaseModel):
    """What the frontend sends during onboarding"""
    user_id: str
    work_style: Optional[str] = None
    communication_style: Optional[str] = None
    writing_sample: Optional[str] = None
    raw_resume_text: Optional[str] = None


class ProfileResponse(BaseModel):
    """Immediate response to frontend"""
    status: str
    message: str
    profile_id: str


# ============================================
# The Cognitive Prompt
# ============================================

VOICE_ANALYSIS_PROMPT = """You are an expert Linguistic Profiler and Behavioral Psychologist.

INPUT DATA:
Work Style: {work_style}
Communication Style: {comm_style}
Writing Sample: {writing_sample}

YOUR TASK: Analyze these inputs to create a 'Voice Fingerprint' and 'Psychological Profile' for this candidate.

OUTPUT JSON FORMAT (respond with ONLY valid JSON, no markdown):
{{
  "voice_fingerprint": {{
    "sentence_length": "Short/Medium/Long",
    "vocabulary_complexity": "Simple/Technical/Academic",
    "tone_keywords": ["Direct", "Empathetic", "Data-driven"],
    "forbidden_phrases": ["List cliches they would never say"]
  }},
  "psychological_profile": {{
    "primary_motivator": "Achievement/Stability/Innovation",
    "apparent_strengths": ["strength1", "strength2"],
    "likely_blindspots": ["blindspot1", "blindspot2"]
  }}
}}"""


# ============================================
# Background Task (Runs Asynchronously)
# ============================================

def analyze_user_voice_task(profile_id: str, inputs: ProfileInput):
    """
    The "Slow" AI Function - Runs in background after API returns.
    Analyzes user inputs and updates the database with AI insights.
    """
    logger.info(f"🧠 Starting background analysis for profile: {profile_id}")
    
    try:
        # Build the prompt
        prompt = VOICE_ANALYSIS_PROMPT.format(
            work_style=inputs.work_style or "Not provided",
            comm_style=inputs.communication_style or "Not provided",
            writing_sample=inputs.writing_sample or inputs.raw_resume_text or "Not provided"
        )
        
        # Call Gemini AI
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        
        # Parse the JSON response
        response_text = response.text.strip()
        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        response_text = response_text.strip()
        
        analysis_json = json.loads(response_text)
        
        # Update Database with the result
        supabase = get_supabase()
        supabase.table('profiles').update({
            "voice_fingerprint": analysis_json.get('voice_fingerprint'),
            "psychological_profile": analysis_json.get('psychological_profile'),
            "is_analyzed": True,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", profile_id).execute()
        
        logger.info(f"✅ Profile {profile_id} analyzed successfully!")
        
    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON parse error for profile {profile_id}: {e}")
        logger.error(f"Raw response: {response.text if 'response' in dir() else 'No response'}")
        # Mark as analyzed with error flag
        try:
            supabase = get_supabase()
            supabase.table('profiles').update({
                "psychological_profile": {"error": "Failed to parse AI response"},
                "is_analyzed": True,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", profile_id).execute()
        except:
            pass
            
    except Exception as e:
        logger.error(f"❌ Error analyzing profile {profile_id}: {e}")
        # Don't crash - just log the error


# ============================================
# API Endpoints
# ============================================

@router.post("/create", response_model=ProfileResponse)
async def create_profile(data: ProfileInput, background_tasks: BackgroundTasks):
    """
    Create a new profile - FAST endpoint.
    
    1. Saves raw data immediately (0.2s)
    2. Triggers AI analysis in background
    3. Returns success immediately (user doesn't wait)
    """
    try:
        supabase = get_supabase()
        
        # A. Save Raw Data Immediately (Fast!)
        new_profile = supabase.table('profiles').insert({
            "user_id": data.user_id,
            "work_style_text": data.work_style,
            "communication_style_text": data.communication_style,
            "writing_sample_text": data.writing_sample,
            "raw_resume_text": data.raw_resume_text,
            "is_analyzed": False
        }).execute()
        
        if not new_profile.data:
            raise HTTPException(status_code=500, detail="Failed to create profile")
        
        profile_id = new_profile.data[0]['id']
        logger.info(f"📝 Profile created: {profile_id} for user: {data.user_id}")
        
        # B. Trigger AI Analysis in Background (Async - returns immediately!)
        background_tasks.add_task(analyze_user_voice_task, profile_id, data)
        
        return ProfileResponse(
            status="success",
            message="Profile created. Analysis starting in background.",
            profile_id=profile_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{profile_id}")
async def get_profile(profile_id: str):
    """
    Get a profile by ID.
    Frontend can poll this to check if analysis is complete.
    """
    try:
        supabase = get_supabase()
        result = supabase.table('profiles').select("*").eq("id", profile_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        profile = result.data[0]
        
        return {
            "success": True,
            "profile": profile,
            "is_analyzed": profile.get("is_analyzed", False)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}")
async def get_profile_by_user(user_id: str):
    """
    Get profile by user_id (for dashboard loading).
    """
    try:
        supabase = get_supabase()
        result = supabase.table('profiles').select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
        
        if not result.data:
            return {
                "success": False,
                "message": "No profile found for this user",
                "profile": None
            }
        
        profile = result.data[0]
        
        return {
            "success": True,
            "profile": profile,
            "is_analyzed": profile.get("is_analyzed", False)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{profile_id}/status")
async def get_analysis_status(profile_id: str):
    """
    Quick status check - is the analysis done?
    Frontend can poll this every few seconds.
    """
    try:
        supabase = get_supabase()
        result = supabase.table('profiles').select("is_analyzed, voice_fingerprint, psychological_profile").eq("id", profile_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        profile = result.data[0]
        
        return {
            "profile_id": profile_id,
            "is_analyzed": profile.get("is_analyzed", False),
            "has_voice_fingerprint": profile.get("voice_fingerprint") is not None,
            "has_psychological_profile": profile.get("psychological_profile") is not None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def profile_engine_health():
    """Health check for profile engine"""
    from app.core.database import check_database_connection
    
    db_status = check_database_connection()
    gemini_configured = bool(settings.GOOGLE_API_KEY)
    
    return {
        "status": "healthy" if db_status["status"] == "connected" and gemini_configured else "degraded",
        "database": db_status,
        "gemini_configured": gemini_configured
    }

