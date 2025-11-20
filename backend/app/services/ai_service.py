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
        max_tokens: int = None
    ) -> Dict[str, Any]:
        """Generate a structured JSON completion"""
        
        response_text = await self.generate_completion(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        # Extract JSON from response (handle markdown code blocks)
        response_text = response_text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        return json.loads(response_text.strip())
    
    async def analyze_resume(self, resume_text: str) -> Dict[str, Any]:
        """Extract experiences and insights from resume"""
        from app.prompts.profile_prompts import RESUME_ANALYSIS_PROMPT, RESUME_SYSTEM_PROMPT
        
        user_prompt = RESUME_ANALYSIS_PROMPT.format(resume_text=resume_text)
        
        return await self.generate_structured_completion(
            system_prompt=RESUME_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.5
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
            temperature=0.5
        )
    
    async def extract_stories(
        self,
        resume_experiences: list,
        personality_profile: Dict[str, Any]
    ) -> list:
        """Extract and structure behavioral stories"""
        from app.prompts.story_prompts import STORY_EXTRACTION_PROMPT, STORY_SYSTEM_PROMPT
        
        user_prompt = STORY_EXTRACTION_PROMPT.format(
            experiences=json.dumps(resume_experiences, indent=2),
            personality=json.dumps(personality_profile, indent=2)
        )
        
        result = await self.generate_structured_completion(
            system_prompt=STORY_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.6
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

