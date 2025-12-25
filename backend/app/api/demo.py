"""
Demo API Routes - Non-personalized behavioral interview answers
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
import google.generativeai as genai
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# ============================================
# Smart Cache - Saves money and makes demo instant
# ============================================
DEMO_CACHE: dict[str, str] = {}

# Pre-populate cache with common questions
DEMO_CACHE["Tell me about a time you led a team through a challenging project"] = """When I was a Senior Software Engineer at a fintech startup, our team was tasked with rebuilding the payment processing system in just 8 weeks—a project that typically takes 4 months.

**Situation:** Our legacy system was causing transaction failures during peak hours, costing us $50K monthly in failed payments.

**Task:** As tech lead, I needed to deliver a reliable, scalable solution while maintaining 99.9% uptime during migration.

**Action:** I broke the project into 2-week sprints, implemented feature flags for gradual rollout, and established daily standups focused on blockers. I personally pair-programmed with junior developers on critical payment logic, and created a comprehensive rollback plan. When we hit an unexpected API rate limit issue in week 6, I negotiated directly with our payment provider for an emergency limit increase.

**Result:** We launched on time with zero downtime. Transaction failures dropped by 94%, saving $47K monthly. The project became a template for future migrations."""

DEMO_CACHE["Describe a situation where you solved a complex technical problem"] = """At my previous company, we faced a critical production issue where our recommendation engine was returning results with 800ms latency—far above our 200ms SLA.

**Situation:** Customer complaints were rising, and our largest enterprise client threatened to cancel their $2M annual contract.

**Task:** I was assigned to diagnose and fix the performance issue within one week.

**Action:** I started with systematic profiling using distributed tracing tools. I discovered our database queries were making N+1 calls due to a recent ORM change. Instead of a quick fix, I implemented query batching with Redis caching for frequently accessed data. I also added performance regression tests to our CI pipeline to prevent future issues.

**Result:** Latency dropped to 120ms—40% below our SLA. We retained the enterprise client and the solution became our standard caching pattern, improving performance across 12 other services."""

DEMO_CACHE["Tell me about a time you had to adapt to a major change at work"] = """When our company pivoted from B2C to B2B mid-product cycle, I had to completely rethink our technical architecture.

**Situation:** We had 6 months of consumer-focused development, but market research showed B2B had 10x revenue potential.

**Task:** As the Product Manager, I needed to salvage our existing work while adapting to enterprise requirements like SSO, audit logs, and multi-tenancy.

**Action:** I conducted rapid customer discovery with 15 potential B2B clients in two weeks. I identified that 70% of our core features were reusable. I created a modular architecture plan that isolated B2B-specific features, allowing us to maintain our consumer product as a "lite" version. I also established weekly syncs with sales to ensure we were building what enterprise buyers actually needed.

**Result:** We launched our B2B product in 4 months instead of starting from scratch. Within a year, B2B revenue exceeded our total B2C projections by 3x."""


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
def get_gold_standard_prompt(question: str) -> str:
    return f"""You are an expert Career Coach. A user has asked the behavioral interview question: '{question}'.

YOUR TASK: Write a perfect 'Gold Standard' response using the STAR method (Situation, Task, Action, Result).

CONSTRAINTS:
- Use a professional but natural tone.
- The 'Action' section must be the longest part.
- Keep the total response under 150 words (about 60 seconds spoken).
- Do not include placeholders like '[Insert name]'. Invent a realistic, impressive scenario involving a Software Engineer or Product Manager context.
- Format with clear **Situation:**, **Task:**, **Action:**, and **Result:** labels.
- Make the scenario specific with real numbers and outcomes.

Write the response now:"""


# ============================================
# API Endpoint
# ============================================
@router.post("/answer", response_model=DemoResponse)
async def generate_demo_answer(request: DemoRequest):
    """
    Generate a demo behavioral interview answer using Google Gemini.
    Uses smart caching for instant responses on repeated questions.
    """
    question = request.question.strip()
    
    # Check cache first (instant response)
    if question in DEMO_CACHE:
        logger.info(f"Cache hit for question: {question[:50]}...")
        return DemoResponse(
            success=True,
            answer=DEMO_CACHE[question],
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
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Generate response
        prompt = get_gold_standard_prompt(question)
        logger.info(f"Generating Gemini response for: {question[:50]}...")
        
        response = model.generate_content(prompt)
        answer_text = response.text.strip()
        
        # Cache the response for future requests
        DEMO_CACHE[question] = answer_text
        logger.info(f"Cached new response. Total cached: {len(DEMO_CACHE)}")
        
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
    return {
        "cached_questions": len(DEMO_CACHE),
        "questions": list(DEMO_CACHE.keys())[:10]  # Show first 10
    }


@router.delete("/cache")
async def clear_cache():
    """Clear the demo cache (for testing)"""
    count = len(DEMO_CACHE)
    DEMO_CACHE.clear()
    return {"message": f"Cleared {count} cached responses"}
