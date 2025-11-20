"""
AI Service - Handles all Google Gemini API interactions
"""
# Claude/Anthropic imports (commented out)
# from anthropic import Anthropic
from app.core.config import settings
from typing import Dict, Any, Optional
import json
import google.generativeai as genai
import os


class AIService:
    """Service for AI model interactions using Google Gemini"""
    
    def __init__(self):
        # Claude/Anthropic initialization (commented out)
        # self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        # self.model = settings.CLAUDE_MODEL
        
        # Google Gemini initialization
        api_key = os.getenv("GOOGLE_API_KEY") or getattr(settings, 'GOOGLE_API_KEY', None)
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables or settings")
        
        genai.configure(api_key=api_key)
        # Use Gemini model from settings or default
        model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')
        self.model = genai.GenerativeModel(model_name)
    
    async def generate_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = None,
        max_tokens: int = None
    ) -> str:
        """Generate a completion from Google Gemini"""
        
        # Combine system and user prompts for Gemini
        # Gemini doesn't have separate system prompts, so we combine them
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        
        # Configure generation parameters
        # Gemini accepts generation_config as a dict or GenerationConfig object
        generation_config = genai.GenerationConfig(
            temperature=temperature or settings.TEMPERATURE,
            max_output_tokens=max_tokens or settings.MAX_TOKENS,
        )
        
        # Generate content
        response = self.model.generate_content(
            full_prompt,
            generation_config=generation_config
        )
        
        return response.text
    
    async def generate_structured_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = None,
        max_tokens: int = None,
        use_json_mode: bool = True
    ) -> Dict[str, Any]:
        """Generate a structured JSON completion with robust error handling"""
        
        # For Gemini, we can try using response_mime_type for JSON mode
        generation_config = genai.GenerationConfig(
            temperature=temperature or settings.TEMPERATURE,
            max_output_tokens=max_tokens or settings.MAX_TOKENS,
        )
        
        # Try to force JSON output with Gemini's JSON mode
        if use_json_mode:
            try:
                generation_config.response_mime_type = "application/json"
            except:
                pass  # Fallback if not supported
        
        # Combine prompts and explicitly request JSON
        full_prompt = f"{system_prompt}\n\n{user_prompt}\n\nIMPORTANT: Return ONLY valid JSON. Ensure all strings are properly escaped."
        
        # Generate content
        response = self.model.generate_content(
            full_prompt,
            generation_config=generation_config
        )
        
        response_text = response.text
        
        # Extract JSON from response (handle markdown code blocks and other wrapping)
        cleaned_text = response_text.strip()
        
        # Remove markdown code fences
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        elif cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]
        
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        
        cleaned_text = cleaned_text.strip()
        
        # Try to parse JSON
        try:
            return json.loads(cleaned_text)
        except json.JSONDecodeError as e:
            # Log the raw response for debugging
            print(f"\n{'='*80}")
            print(f"JSON Parse Error at position {e.pos}: {e.msg}")
            print(f"Response length: {len(cleaned_text)} chars")
            print(f"Context around error (±200 chars):")
            print(f"...{cleaned_text[max(0, e.pos-200):min(len(cleaned_text), e.pos+200)]}...")
            print(f"First 1000 chars:\n{cleaned_text[:1000]}")
            print(f"Last 1000 chars:\n{cleaned_text[-1000:]}")
            print(f"{'='*80}\n")
            
            # Try to extract JSON from within the text (sometimes AI adds prose)
            # Look for the first { and last }
            first_brace = cleaned_text.find('{')
            last_brace = cleaned_text.rfind('}')
            
            if first_brace != -1 and last_brace != -1 and first_brace < last_brace:
                json_candidate = cleaned_text[first_brace:last_brace+1]
                try:
                    return json.loads(json_candidate)
                except json.JSONDecodeError as e2:
                    print(f"Fallback extraction also failed: {e2.msg} at position {e2.pos}")
            
            # If all else fails, raise with more context
            raise ValueError(
                f"Failed to parse JSON response. Error: {e.msg} at position {e.pos}. "
                f"Response length: {len(cleaned_text)} chars. "
                f"Check backend logs for full context."
            )
    
    async def analyze_resume(self, resume_text: str) -> Dict[str, Any]:
        """Extract experiences and insights from resume"""
        from app.prompts.profile_prompts import RESUME_ANALYSIS_PROMPT, RESUME_SYSTEM_PROMPT
        
        user_prompt = RESUME_ANALYSIS_PROMPT.format(resume_text=resume_text)
        
        return await self.generate_structured_completion(
            system_prompt=RESUME_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.5,
            use_json_mode=True
        )
    
    async def analyze_personality(
        self,
        questionnaire_responses: Dict[str, Any],
        writing_sample: Optional[str] = None
    ) -> Dict[str, Any]:
        """Analyze personality and communication style"""
        from app.prompts.profile_prompts import PERSONALITY_ANALYSIS_PROMPT, PERSONALITY_SYSTEM_PROMPT
        
        user_prompt = PERSONALITY_ANALYSIS_PROMPT.format(
            responses=json.dumps(questionnaire_responses, indent=2),
            writing_sample=writing_sample or "No writing sample provided"
        )
        
        return await self.generate_structured_completion(
            system_prompt=PERSONALITY_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.5,
            use_json_mode=True
        )
    
    async def extract_stories(
        self,
        resume_experiences: list,
        personality_profile: Dict[str, Any]
    ) -> list:
        """Extract and structure behavioral stories"""
        from app.prompts.story_prompts import STORY_EXTRACTION_PROMPT, STORY_SYSTEM_PROMPT
        
        # Limit experiences to prevent overly long responses
        limited_experiences = resume_experiences[:8]  # Max 8 experiences
        
        user_prompt = STORY_EXTRACTION_PROMPT.format(
            experiences=json.dumps(limited_experiences, indent=2),
            personality=json.dumps(personality_profile, indent=2)
        )
        
        # Use higher max_tokens for story generation and enable JSON mode
        result = await self.generate_structured_completion(
            system_prompt=STORY_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.6,
            max_tokens=8192,  # Allow longer responses for stories
            use_json_mode=True
        )
        
        return result.get("stories", [])
    
    async def route_question(
        self,
        question: str,
        stories: list,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Route question to best matching story"""
        from app.prompts.question_prompts import QUESTION_ROUTING_PROMPT, QUESTION_SYSTEM_PROMPT
        
        user_prompt = QUESTION_ROUTING_PROMPT.format(
            question=question,
            stories=json.dumps(stories, indent=2),
            context=context or "No additional context"
        )
        
        return await self.generate_structured_completion(
            system_prompt=QUESTION_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.4
        )
    
    async def generate_answer(
        self,
        question: str,
        story: Dict[str, Any],
        personality_profile: Dict[str, Any],
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate personalized answer"""
        from app.prompts.answer_prompts import ANSWER_GENERATION_PROMPT, ANSWER_SYSTEM_PROMPT
        
        user_prompt = ANSWER_GENERATION_PROMPT.format(
            question=question,
            story=json.dumps(story, indent=2),
            personality=json.dumps(personality_profile, indent=2),
            context=context or "No additional context"
        )
        
        return await self.generate_structured_completion(
            system_prompt=ANSWER_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.7
        )
    
    async def score_practice_attempt(
        self,
        question: str,
        transcript: str,
        expected_story: Dict[str, Any],
        personality_profile: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Score a practice attempt"""
        from app.prompts.practice_prompts import PRACTICE_SCORING_PROMPT, PRACTICE_SYSTEM_PROMPT
        
        user_prompt = PRACTICE_SCORING_PROMPT.format(
            question=question,
            transcript=transcript,
            expected_story=json.dumps(expected_story, indent=2),
            personality=json.dumps(personality_profile, indent=2)
        )
        
        return await self.generate_structured_completion(
            system_prompt=PRACTICE_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.5
        )
    
    async def improve_answer(
        self,
        original_transcript: str,
        feedback: Dict[str, Any],
        personality_profile: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate improved version of answer"""
        from app.prompts.practice_prompts import ANSWER_IMPROVEMENT_PROMPT, IMPROVEMENT_SYSTEM_PROMPT
        
        user_prompt = ANSWER_IMPROVEMENT_PROMPT.format(
            transcript=original_transcript,
            feedback=json.dumps(feedback, indent=2),
            personality=json.dumps(personality_profile, indent=2)
        )
        
        return await self.generate_structured_completion(
            system_prompt=IMPROVEMENT_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.7
        )
    
    async def generate_practice_plan(
        self,
        user_profile: Dict[str, Any],
        stories: list,
        past_attempts: list,
        duration_days: int = 7
    ) -> Dict[str, Any]:
        """Generate personalized practice plan"""
        from app.prompts.plan_prompts import PLAN_GENERATION_PROMPT, PLAN_SYSTEM_PROMPT
        
        user_prompt = PLAN_GENERATION_PROMPT.format(
            profile=json.dumps(user_profile, indent=2),
            stories=json.dumps(stories, indent=2),
            past_attempts=json.dumps(past_attempts, indent=2),
            duration=duration_days
        )
        
        return await self.generate_structured_completion(
            system_prompt=PLAN_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.6
        )


# Global instance
ai_service = AIService()

