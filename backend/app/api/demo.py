"""
Demo API Routes - Non-personalized behavioral interview answers
Uses Supabase PostgreSQL for persistent caching
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
import google.generativeai as genai
from app.core.config import settings
import logging
import random

logger = logging.getLogger(__name__)

router = APIRouter()

# ============================================
# Role Diversity - Avoid engineer bias
# ============================================
DIVERSE_ROLES = [
    "Software Engineer",
    "Product Manager", 
    "Marketing Manager",
    "Registered Nurse",
    "Sales Representative",
    "Financial Analyst",
    "HR Manager",
    "Operations Manager",
    "Teacher",
    "Consultant",
    "Project Manager",
    "Customer Success Manager",
]

# ============================================
# In-Memory Fallback Cache (if DB not configured)
# ============================================
MEMORY_CACHE: dict[str, str] = {}

# Pre-populate with common questions for instant demo
FALLBACK_ANSWERS = {
    "Tell me about a time you led a team through a challenging project": """When I was a Senior Software Engineer at a fintech startup, our team was tasked with rebuilding the payment processing system in just 8 weeks—a project that typically takes 4 months.

**Situation:** Our legacy system was causing transaction failures during peak hours, costing us $50K monthly in failed payments.

**Task:** As tech lead, I needed to deliver a reliable, scalable solution while maintaining 99.9% uptime during migration.

**Action:** I broke the project into 2-week sprints, implemented feature flags for gradual rollout, and established daily standups focused on blockers. I personally pair-programmed with junior developers on critical payment logic, and created a comprehensive rollback plan. When we hit an unexpected API rate limit issue in week 6, I negotiated directly with our payment provider for an emergency limit increase.

**Result:** We launched on time with zero downtime. Transaction failures dropped by 94%, saving $47K monthly. The project became a template for future migrations.""",

    "Describe a situation where you solved a complex technical problem": """At my previous company, we faced a critical production issue where our recommendation engine was returning results with 800ms latency—far above our 200ms SLA.

**Situation:** Customer complaints were rising, and our largest enterprise client threatened to cancel their $2M annual contract.

**Task:** I was assigned to diagnose and fix the performance issue within one week.

**Action:** I started with systematic profiling using distributed tracing tools. I discovered our database queries were making N+1 calls due to a recent ORM change. Instead of a quick fix, I implemented query batching with Redis caching for frequently accessed data. I also added performance regression tests to our CI pipeline to prevent future issues.

**Result:** Latency dropped to 120ms—40% below our SLA. We retained the enterprise client and the solution became our standard caching pattern, improving performance across 12 other services.""",

    "Tell me about a time you had to adapt to a major change at work": """When our company pivoted from B2C to B2B mid-product cycle, I had to completely rethink our technical architecture.

**Situation:** We had 6 months of consumer-focused development, but market research showed B2B had 10x revenue potential.

**Task:** As the Product Manager, I needed to salvage our existing work while adapting to enterprise requirements like SSO, audit logs, and multi-tenancy.

**Action:** I conducted rapid customer discovery with 15 potential B2B clients in two weeks. I identified that 70% of our core features were reusable. I created a modular architecture plan that isolated B2B-specific features, allowing us to maintain our consumer product as a "lite" version. I also established weekly syncs with sales to ensure we were building what enterprise buyers actually needed.

**Result:** We launched our B2B product in 4 months instead of starting from scratch. Within a year, B2B revenue exceeded our total B2C projections by 3x."""
}

# Initialize memory cache with fallback answers
MEMORY_CACHE.update(FALLBACK_ANSWERS)


# ============================================
# Database Cache Functions (with fallback)
# ============================================
def is_database_configured() -> bool:
    """Check if Supabase is properly configured"""
    return bool(settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY)


def get_cached_answer(question: str) -> Optional[str]:
    """
    Get cached answer - tries database first, then memory
    """
    # Try database if configured
    if is_database_configured():
        try:
            from app.core.database import get_cached_demo_answer
            answer = get_cached_demo_answer(question)
            if answer:
                return answer
        except Exception as e:
            logger.warning(f"Database cache lookup failed, using memory: {e}")
    
    # Fallback to memory cache
    return MEMORY_CACHE.get(question)


def save_to_cache(question: str, answer: str, role_context: Optional[str] = None):
    """
    Save answer to cache - tries database first, always saves to memory
    """
    # Always save to memory
    MEMORY_CACHE[question] = answer
    
    # Try database if configured
    if is_database_configured():
        try:
            from app.core.database import cache_demo_answer
            cache_demo_answer(question, answer, role_context)
            logger.info(f"Cached to database: {question[:50]}...")
        except Exception as e:
            logger.warning(f"Database cache save failed: {e}")


# ============================================
# Request/Response Models
# ============================================
class DemoRequest(BaseModel):
    question: str
    company_context: Optional[str] = None
    role_context: Optional[str] = None
    industry: Optional[str] = None


class DemoResponse(BaseModel):
    success: bool
    answer: str
    structure: str = "STAR"
    key_points: list[str] = []
    estimated_time_seconds: int = 60
    cached: bool = False


# ============================================
# The Gold Standard Prompt
# ============================================
def get_gold_standard_prompt(question: str, role: str = None) -> str:
    # Randomly select a diverse role if none provided
    selected_role = role if role else random.choice(DIVERSE_ROLES)
    
    return f"""You are an expert Career Coach. A user has asked the behavioral interview question: '{question}'.

YOUR TASK: Write a perfect 'Gold Standard' response using the STAR method (Situation, Task, Action, Result).

CONTEXT: The candidate is a {selected_role}.

CONSTRAINTS:
- Use a professional but natural tone.
- The 'Action' section must be the longest part.
- Keep the total response under 150 words (about 60 seconds spoken).
- Do not include placeholders like '[Insert name]'. Invent a realistic, impressive scenario specific to a {selected_role}'s work environment.
- Format with clear **Situation:**, **Task:**, **Action:**, and **Result:** labels.
- Make the scenario specific with real numbers and outcomes relevant to the {selected_role} role.

Write the response now:"""


# ============================================
# API Endpoints
# ============================================
@router.post("/answer", response_model=DemoResponse)
async def generate_demo_answer(request: DemoRequest):
    """
    Generate a demo behavioral interview answer using Google Gemini.
    Uses Supabase for persistent caching with memory fallback.
    """
    question = request.question.strip()
    
    # Check cache first (instant response)
    cached_answer = get_cached_answer(question)
    if cached_answer:
        logger.info(f"Cache hit for question: {question[:50]}...")
        return DemoResponse(
            success=True,
            answer=cached_answer,
            structure="STAR",
            key_points=["Clear situation context", "Specific actions taken", "Quantified results"],
            estimated_time_seconds=60,
            cached=True
        )
    
    # Not in cache - call Gemini
    try:
        # Configure Gemini
        api_key = settings.GOOGLE_API_KEY
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Google API key not configured"
            )
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Generate response with role context
        role_context = request.role_context
        prompt = get_gold_standard_prompt(question, role_context)
        logger.info(f"Generating Gemini response for: {question[:50]}...")
        
        response = model.generate_content(prompt)
        answer_text = response.text.strip()
        
        # Cache the response (database + memory)
        save_to_cache(question, answer_text, role_context)
        logger.info(f"Cached new response. Memory cache size: {len(MEMORY_CACHE)}")
        
        # Extract key points from the answer
        key_points = []
        if "Situation:" in answer_text or "**Situation" in answer_text:
            key_points.append("Clear STAR structure")
        if any(char.isdigit() for char in answer_text):
            key_points.append("Includes quantified results")
        if "I " in answer_text:
            key_points.append("Personal ownership demonstrated")
        
        return DemoResponse(
            success=True,
            answer=answer_text,
            structure="STAR",
            key_points=key_points if key_points else ["Professional response", "Clear structure"],
            estimated_time_seconds=60,
            cached=False
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating demo answer: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating answer: {str(e)}"
        )


@router.get("/cache-stats")
async def get_cache_stats():
    """Get cache statistics for monitoring"""
    stats = {
        "memory_cache_size": len(MEMORY_CACHE),
        "memory_questions": list(MEMORY_CACHE.keys())[:5],
        "database_configured": is_database_configured()
    }
    
    # Try to get database stats
    if is_database_configured():
        try:
            from app.core.database import get_cache_stats as db_cache_stats
            db_stats = db_cache_stats()
            stats["database_cache_size"] = db_stats.get("total_cached", 0)
            stats["database_questions"] = db_stats.get("questions", [])
        except Exception as e:
            stats["database_error"] = str(e)
    
    return stats


@router.delete("/cache")
async def clear_cache():
    """Clear the demo cache (for testing)"""
    memory_count = len(MEMORY_CACHE)
    MEMORY_CACHE.clear()
    MEMORY_CACHE.update(FALLBACK_ANSWERS)  # Keep fallback answers
    
    db_count = 0
    if is_database_configured():
        try:
            from app.core.database import clear_demo_cache
            db_count = clear_demo_cache()
        except Exception as e:
            logger.warning(f"Database cache clear failed: {e}")
    
    return {
        "message": f"Cleared cache",
        "memory_cleared": memory_count - len(FALLBACK_ANSWERS),
        "database_cleared": db_count
    }


@router.get("/health")
async def check_demo_health():
    """Check demo service health including database connection"""
    health = {
        "status": "healthy",
        "gemini_configured": bool(settings.GOOGLE_API_KEY),
        "database_configured": is_database_configured(),
        "supabase_url": settings.SUPABASE_URL[:30] + "..." if settings.SUPABASE_URL else None,
        "service_key_set": bool(settings.SUPABASE_SERVICE_ROLE_KEY),
    }
    
    if is_database_configured():
        try:
            from app.core.database import check_database_connection
            db_health = check_database_connection()
            health["database_status"] = db_health["status"]
            if "message" in db_health:
                health["database_message"] = db_health["message"]
        except Exception as e:
            health["database_status"] = "error"
            health["database_error"] = str(e)
    
    return health


@router.post("/test-db")
async def test_database_write():
    """Test writing to database"""
    if not is_database_configured():
        return {"success": False, "error": "Database not configured"}
    
    try:
        from app.core.database import get_supabase
        supabase = get_supabase()
        
        # Try to insert a test record
        test_question = f"__TEST_QUESTION_{__import__('time').time()}__"
        result = supabase.table("demo_cache").insert({
            "question": test_question,
            "answer": "Test answer for database verification"
        }).execute()
        
        # Clean up
        supabase.table("demo_cache").delete().eq("question", test_question).execute()
        
        return {
            "success": True,
            "message": "Database write test successful",
            "inserted_id": result.data[0]["id"] if result.data else None
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }
