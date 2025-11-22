"""
AI Service - Handles AI model interactions with Claude (preferred) and Gemini (fallback)
"""
from anthropic import Anthropic
from app.core.config import settings
from typing import Dict, Any, Optional, Literal
import json
import google.generativeai as genai
import os


class AIService:
    """Service for AI model interactions with provider selection"""

    def __init__(self):
        # Initialize available providers
        self.providers = {}

        # Claude/Anthropic (preferred)
        claude_key = os.getenv("CLAUDE_API_KEY") or getattr(settings, 'CLAUDE_API_KEY', None)
        if claude_key:
            try:
                self.providers['claude'] = Anthropic(api_key=claude_key)
                print("✓ Claude API initialized")
            except Exception as e:
                print(f"⚠ Claude initialization failed: {e}")

        # Google Gemini (fallback)
        gemini_key = os.getenv("GOOGLE_API_KEY") or getattr(settings, 'GOOGLE_API_KEY', None)
        if gemini_key:
            try:
                genai.configure(api_key=gemini_key)
                self.providers['gemini'] = genai
                print("✓ Gemini API initialized")
            except Exception as e:
                print(f"⚠ Gemini initialization failed: {e}")

        if not self.providers:
            raise ValueError("No AI providers available. Please set CLAUDE_API_KEY or GOOGLE_API_KEY")

        print(f"Available providers: {list(self.providers.keys())}")

    def _get_preferred_provider(self, task: str) -> str:
        """Get the preferred provider for a task"""
        # Claude is preferred for most tasks
        if 'claude' in self.providers:
            return 'claude'
        elif 'gemini' in self.providers:
            return 'gemini'
        else:
            raise ValueError("No AI providers available")

    def _get_model_for_task(self, task: str, provider: str) -> str:
        """Get the appropriate model for a task and provider"""
        task_models = {
            'demo_answer': {
                'claude': settings.CLAUDE_HAIKU_MODEL,  # Fast for demos
                'gemini': settings.GEMINI_MODEL
            },
            'personality_analysis': {
                'claude': settings.CLAUDE_SONNET_MODEL,  # Complex analysis
                'gemini': settings.GEMINI_MODEL
            },
            'resume_processing': {
                'claude': settings.CLAUDE_SONNET_MODEL,
                'gemini': settings.GEMINI_MODEL
            },
            'story_generation': {
                'claude': settings.CLAUDE_SONNET_MODEL,
                'gemini': settings.GEMINI_MODEL
            },
            'answer_personalization': {
                'claude': settings.CLAUDE_SONNET_MODEL,
                'gemini': settings.GEMINI_MODEL
            },
            'practice_scoring': {
                'claude': settings.CLAUDE_SONNET_MODEL,
                'gemini': settings.GEMINI_MODEL
            }
        }

        return task_models.get(task, {}).get(provider, settings.GEMINI_MODEL)
    
    async def generate_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = None,
        max_tokens: int = None,
        task: str = "general"
    ) -> str:
        """Generate a completion using available AI providers"""

        provider = self._get_preferred_provider(task)

        if provider == 'claude':
            return await self._generate_claude_completion(
                system_prompt, user_prompt, temperature, max_tokens, task
            )
        elif provider == 'gemini':
            return await self._generate_gemini_completion(
                system_prompt, user_prompt, temperature, max_tokens
            )
        else:
            raise ValueError(f"Unsupported provider: {provider}")

    async def _generate_claude_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = None,
        max_tokens: int = None,
        task: str = "general"
    ) -> str:
        """Generate completion using Claude"""
        model = self._get_model_for_task(task, 'claude')

        try:
            response = self.providers['claude'].messages.create(
                model=model,
                max_tokens=max_tokens or settings.MAX_TOKENS,
                temperature=temperature or settings.TEMPERATURE,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_prompt}
                ]
            )
            return response.content[0].text
        except Exception as e:
            raise Exception(f"Claude API error: {str(e)}")

    async def _generate_gemini_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = None,
        max_tokens: int = None
    ) -> str:
        """Generate completion using Gemini (fallback)"""
        if 'gemini' not in self.providers:
            raise ValueError("Gemini not available")

        model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')
        model = genai.GenerativeModel(model_name)

        # Combine system and user prompts for Gemini
        full_prompt = f"{system_prompt}\n\n{user_prompt}"

        generation_config = genai.GenerationConfig(
            temperature=temperature or settings.TEMPERATURE,
            max_output_tokens=max_tokens or settings.MAX_TOKENS,
        )

        try:
            response = model.generate_content(
                full_prompt,
                generation_config=generation_config
            )
            return response.text
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")
    
    async def generate_structured_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = None,
        max_tokens: int = None,
        use_json_mode: bool = True,
        task: str = "general"
    ) -> Dict[str, Any]:
        """Generate a structured JSON completion with provider selection"""

        provider = self._get_preferred_provider(task)

        if provider == 'claude':
            return await self._generate_claude_structured(
                system_prompt, user_prompt, temperature, max_tokens, use_json_mode
            )
        elif provider == 'gemini':
            return await self._generate_gemini_structured(
                system_prompt, user_prompt, temperature, max_tokens, use_json_mode
            )
        else:
            raise ValueError(f"Unsupported provider: {provider}")

    async def _generate_claude_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = None,
        max_tokens: int = None,
        use_json_mode: bool = True
    ) -> Dict[str, Any]:
        """Generate structured completion using Claude"""
        model = self._get_model_for_task("structured", 'claude')  # Use Sonnet for structured tasks

        enhanced_system = system_prompt
        enhanced_user = user_prompt

        if use_json_mode:
            enhanced_system += "\n\nAlways respond with valid JSON. Do not include any other text or explanations."
            enhanced_user += "\n\nRespond with valid JSON only."

        try:
            response = self.providers['claude'].messages.create(
                model=model,
                max_tokens=max_tokens or settings.MAX_TOKENS,
                temperature=temperature or settings.TEMPERATURE,
                system=enhanced_system,
                messages=[
                    {"role": "user", "content": enhanced_user}
                ]
            )

            text = response.content[0].text.strip()

            if use_json_mode:
                try:
                    return json.loads(text)
                except json.JSONDecodeError:
                    # Try to extract JSON
                    import re
                    json_match = re.search(r'\{.*\}', text, re.DOTALL)
                    if json_match:
                        try:
                            return json.loads(json_match.group())
                        except json.JSONDecodeError:
                            pass
                    return {"response": text, "parsed": False}
            else:
                return {"response": text}

        except Exception as e:
            raise Exception(f"Claude structured completion error: {str(e)}")

    async def _generate_gemini_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = None,
        max_tokens: int = None,
        use_json_mode: bool = True
    ) -> Dict[str, Any]:
        """Generate structured completion using Gemini (fallback)"""
        if 'gemini' not in self.providers:
            raise ValueError("Gemini not available")

        model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')
        model = genai.GenerativeModel(model_name)

        generation_config = genai.GenerationConfig(
            temperature=temperature or settings.TEMPERATURE,
            max_output_tokens=max_tokens or settings.MAX_TOKENS,
        )

        # Try to force JSON output
        if use_json_mode:
            try:
                generation_config.response_mime_type = "application/json"
            except:
                pass  # Not supported in all versions

        full_prompt = f"{system_prompt}\n\n{user_prompt}\n\nIMPORTANT: Return ONLY valid JSON. Ensure all strings are properly escaped."

        max_attempts = 3
        for attempt in range(max_attempts):
            try:
                response = model.generate_content(
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
                if use_json_mode:
                    try:
                        return json.loads(cleaned_text)
                    except json.JSONDecodeError as e:
                        # Try to extract JSON from within the text
                        first_brace = cleaned_text.find('{')
                        last_brace = cleaned_text.rfind('}')

                        if first_brace != -1 and last_brace != -1 and first_brace < last_brace:
                            json_candidate = cleaned_text[first_brace:last_brace+1]
                            try:
                                return json.loads(json_candidate)
                            except json.JSONDecodeError:
                                pass

                        return {"response": cleaned_text, "parsed": False}
                else:
                    return {"response": cleaned_text}

            except Exception as e:
                if attempt == max_attempts - 1:
                    raise Exception(f"Gemini structured completion error after {max_attempts} attempts: {str(e)}")
                continue

        raise Exception("Unexpected error in Gemini structured completion")
    
    async def analyze_resume(self, resume_text: str) -> Dict[str, Any]:
        """Extract experiences and insights from resume"""
        from app.prompts.profile_prompts import RESUME_ANALYSIS_PROMPT, RESUME_SYSTEM_PROMPT
        
        user_prompt = RESUME_ANALYSIS_PROMPT.format(resume_text=resume_text)
        
        return await self.generate_structured_completion(
            system_prompt=RESUME_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.5,
            use_json_mode=True,
            task="resume_processing"
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
            use_json_mode=True,
            task="personality_analysis"
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
            use_json_mode=True,
            task="story_generation"
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
            temperature=0.4,
            task="question_routing"
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
            temperature=0.7,
            task="answer_personalization"
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
            task="practice_scoring",
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
            temperature=0.7,
            task="practice_improvement"
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
            task="plan_generation",
            user_prompt=user_prompt,
            temperature=0.6
        )


# Global instance
ai_service = AIService()

