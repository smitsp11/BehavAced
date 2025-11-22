"""
MVP Service - Phase 1 core functionality for behavioral interview coaching
"""
from typing import Dict, List, Any, Optional, Tuple
import json
import re
from datetime import datetime
from app.services import ai_service, storage
from app.core.config import settings
from app.prompts import (
    demo_answer_prompts,
    personality_embed_prompts,
    manual_experience_prompts,
    story_brain_prompts,
    personalized_answer_prompts
)
from app.models.schemas import (
    PersonalityTraits,
    CommunicationStyle,
    PersonalitySnapshot,
    StoryBrain,
    StoryCluster,
    Story
)


class MVPService:
    """Service for MVP Phase 1 functionality"""

    def __init__(self):
        self.ai_service = ai_service
        self.storage = storage

    async def generate_demo_answer(
        self,
        question: str,
        company_context: str = None,
        role_context: str = None,
        industry: str = None
    ) -> Dict[str, Any]:
        """Generate a non-personalized demo answer"""

        # Get prompts
        system_prompt, user_prompt = demo_answer_prompts.get_demo_answer_prompts(
            question=question,
            company_context=company_context,
            role_context=role_context,
            industry=industry
        )

        # Generate structured JSON response using configured model
        model_config = self._get_model_config("DEMO_ANSWER_MODEL")
        
        try:
            # Use generate_structured_completion instead of generate_completion
            # This returns parsed JSON instead of raw text
            parsed_response = await self.ai_service.generate_structured_completion(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=model_config.get("temperature", 0.7),
                max_tokens=model_config.get("max_tokens", 2000),
                use_json_mode=True,
                task="demo_answer"
            )
            
            # Extract fields from parsed JSON response
            answer_text = parsed_response.get("answer_text") or parsed_response.get("answer", "")
            structure = parsed_response.get("structure", "STAR")
            key_points = parsed_response.get("key_points", [])
            estimated_time = parsed_response.get("estimated_time_seconds", 60)
            
            # Clean up answer text - remove any markdown formatting that might have leaked through
            if isinstance(answer_text, str):
                # Remove markdown code blocks if present
                answer_text = re.sub(r'```json\s*', '', answer_text)
                answer_text = re.sub(r'```\s*$', '', answer_text)
                answer_text = answer_text.strip()
                
                # If response was wrapped in markdown, try to extract just the answer
                # Look for patterns like "### 1. Complete Answer Text" followed by quoted text
                quoted_match = re.search(r'"([^"]+(?:\\.[^"]*)*)"', answer_text)
                if quoted_match and len(quoted_match.group(1)) > 50:
                    answer_text = quoted_match.group(1)
            
            # Validate we have an answer
            if not answer_text or len(answer_text) < 50:
                raise ValueError("Generated answer text is too short or empty")
            
            return {
                "answer": answer_text,
                "structure": structure,
                "key_points": key_points if isinstance(key_points, list) else ["Key achievement demonstrated"],
                "estimated_time_seconds": estimated_time if isinstance(estimated_time, int) else 60
            }
            
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            # If JSON parsing failed, try to extract answer from raw response
            try:
                raw_response = await self.ai_service.generate_completion(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=model_config.get("temperature", 0.7),
                    max_tokens=model_config.get("max_tokens", 2000),
                    task="demo_answer"
                )
                
                # Try to extract JSON from raw response
                json_match = re.search(r'\{.*\}', raw_response, re.DOTALL)
                if json_match:
                    try:
                        parsed = json.loads(json_match.group())
                        return {
                            "answer": parsed.get("answer_text", raw_response),
                            "structure": parsed.get("structure", "STAR"),
                            "key_points": parsed.get("key_points", ["Key achievement demonstrated"]),
                            "estimated_time_seconds": parsed.get("estimated_time_seconds", 60)
                        }
                    except:
                        pass
                
                # Last resort: return raw response with defaults
                return {
                    "answer": raw_response,
                    "structure": "STAR",
                    "key_points": ["Key achievement demonstrated"],
                    "estimated_time_seconds": 60
                }
            except Exception as fallback_error:
                raise Exception(f"Error generating demo answer: {str(e)} (fallback also failed: {str(fallback_error)})")
        except Exception as e:
            raise Exception(f"Error generating demo answer: {str(e)}")

    async def create_personality_snapshot(
        self,
        user_id: str,
        responses: Dict[str, Any],
        writing_sample: Optional[str] = None
    ) -> PersonalitySnapshot:
        """Create personality snapshot with embedding"""

        # Get prompts
        system_prompt, user_prompt = personality_embed_prompts.get_personality_analysis_prompts(
            responses=responses,
            writing_sample=writing_sample
        )

        # Generate analysis using configured model
        model_config = self._get_model_config("PERSONALITY_EMBED_MODEL")
        response = await self.ai_service.generate_completion(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=model_config.get("temperature", 0.3),  # Lower temperature for consistency
            max_tokens=model_config.get("max_tokens", 1500)
        )

        # Parse personality analysis
        try:
            analysis = json.loads(response)

            # Normalize traits
            traits = []
            for trait_name in analysis.get("personality_traits", []):
                if hasattr(PersonalityTraits, trait_name.upper()):
                    traits.append(getattr(PersonalityTraits, trait_name.upper()))

            # Create communication style
            comm_style_data = analysis.get("communication_style", {})
            communication_style = CommunicationStyle(
                vocabulary_level=comm_style_data.get("vocabulary_level", "moderate"),
                sentence_complexity=comm_style_data.get("sentence_complexity", "medium"),
                tone=comm_style_data.get("tone", "conversational"),
                pace=comm_style_data.get("pace", "moderate"),
                detail_preference=comm_style_data.get("detail_preference", "balanced"),
                storytelling_style=comm_style_data.get("storytelling_style", "narrative")
            )

            # Create snapshot
            snapshot = PersonalitySnapshot(
                traits=traits,
                communication_style=communication_style,
                strengths=analysis.get("strengths", []),
                weaknesses=analysis.get("weaknesses", []),
                confidence_level=analysis.get("confidence_level", 5),
                embedding=[],  # Would generate actual embedding here
                tone_profile=analysis.get("tone_profile", {})
            )

            return snapshot

        except Exception as e:
            # Fallback snapshot
            communication_style = CommunicationStyle(
                vocabulary_level="moderate",
                sentence_complexity="medium",
                tone="conversational",
                pace="moderate",
                detail_preference="balanced",
                storytelling_style="narrative"
            )

            return PersonalitySnapshot(
                traits=[PersonalityTraits.COLLABORATIVE, PersonalityTraits.DETAIL_ORIENTED],
                communication_style=communication_style,
                strengths=["Good communication", "Detail-oriented"],
                weaknesses=["Could be more assertive"],
                confidence_level=5,
                embedding=[],
                tone_profile={}
            )

    async def process_manual_experience(
        self,
        user_id: str,
        experiences: List[Dict[str, Any]],
        education: Optional[Dict[str, Any]] = None,
        additional_skills: List[str] = None
    ) -> Dict[str, Any]:
        """Process manually entered experience data"""

        # Get prompts
        system_prompt, user_prompt = manual_experience_prompts.get_experience_processing_prompts(
            experiences=experiences,
            additional_skills=additional_skills or []
        )

        # Generate analysis using configured model
        model_config = self._get_model_config("MANUAL_EXPERIENCE_MODEL")
        response = await self.ai_service.generate_completion(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=model_config.get("temperature", 0.4),
            max_tokens=model_config.get("max_tokens", 2500)
        )

        # Parse and structure response
        try:
            analysis = json.loads(response)

            # Extract story candidates
            story_candidates = []
            for exp_analysis in analysis.get("processed_experiences", []):
                for achievement in exp_analysis.get("achievements", []):
                    if any(keyword in achievement.lower() for keyword in ["led", "managed", "created", "improved", "increased", "reduced"]):
                        story_candidates.append({
                            "role_title": exp_analysis.get("role_title"),
                            "company": exp_analysis.get("company"),
                            "accomplishment": achievement,
                            "quantified": any(char.isdigit() for char in achievement),
                            "competencies": exp_analysis.get("competencies", []),
                            "themes": ["leadership", "achievement"]
                        })

            return {
                "processed_experiences": analysis.get("processed_experiences", []),
                "extracted_stories": story_candidates,
                "skills_analysis": analysis.get("skills_analysis", {})
            }

        except Exception as e:
            # Fallback processing
            story_candidates = []
            for exp in experiences:
                for achievement in exp.get("achievements", []):
                    story_candidates.append({
                        "role_title": exp.get("role_title"),
                        "company": exp.get("company"),
                        "accomplishment": achievement,
                        "quantified": False,
                        "competencies": ["general"],
                        "themes": ["experience"]
                    })

            return {
                "processed_experiences": experiences,
                "extracted_stories": story_candidates,
                "skills_analysis": {"technical": [], "soft": []}
            }

    async def generate_story_brain(self, user_id: str) -> StoryBrain:
        """Generate clustered story bank"""

        # Get user's stories
        stories = self.storage.get_stories(user_id)
        if not stories:
            raise ValueError("No stories found for user")

        # Get prompts
        system_prompt, user_prompt = story_brain_prompts.get_story_brain_prompts(stories)

        # Generate story brain using configured model
        model_config = self._get_model_config("STORY_BRAIN_MODEL")
        response = await self.ai_service.generate_completion(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=model_config.get("temperature", 0.3),
            max_tokens=model_config.get("max_tokens", 3000)
        )

        # Parse and create story clusters
        try:
            analysis = json.loads(response)

            clusters = []
            for cluster_data in analysis.get("story_clusters", []):
                # Convert story data to Story objects
                cluster_stories = []
                for story_data in cluster_data.get("stories", []):
                    story = Story(
                        story_id=story_data.get("story_id", ""),
                        title=story_data.get("title", ""),
                        situation=story_data.get("situation", ""),
                        task="",  # Would need to extract from data
                        actions=story_data.get("actions", []),
                        result=story_data.get("result", ""),
                        themes=story_data.get("themes", []),
                        competencies=story_data.get("competencies", []),
                        emotional_arc="",  # Would need to determine
                        impact_level=story_data.get("impact_level", 5),
                        star_version="",  # Would generate
                        soar_version="",  # Would generate
                        compressed_version="",  # Would generate
                        detailed_version=""  # Would generate
                    )
                    cluster_stories.append(story)

                cluster = StoryCluster(
                    cluster_id=cluster_data.get("cluster_id", ""),
                    theme=cluster_data.get("theme", ""),
                    competency=cluster_data.get("competency", ""),
                    stories=cluster_stories,
                    confidence=cluster_data.get("confidence", 0.8)
                )
                clusters.append(cluster)

            story_brain = StoryBrain(
                user_id=user_id,
                clusters=clusters,
                total_stories=len(stories),
                embedding_model="sentence-transformers",
                generated_at=datetime.now()
            )

            return story_brain

        except Exception as e:
            # Fallback: create basic clusters
            all_stories = []
            for story_data in stories:
                story = Story(
                    story_id=story_data.get("story_id", ""),
                    title=story_data.get("title", "Experience"),
                    situation=story_data.get("situation", ""),
                    task="",
                    actions=story_data.get("actions", []),
                    result=story_data.get("result", ""),
                    themes=["experience"],
                    competencies=["general"],
                    emotional_arc="",
                    impact_level=5,
                    star_version="",
                    soar_version="",
                    compressed_version="",
                    detailed_version=""
                )
                all_stories.append(story)

            cluster = StoryCluster(
                cluster_id="general",
                theme="General Experience",
                competency="Professional Development",
                stories=all_stories,
                confidence=0.5
            )

            return StoryBrain(
                user_id=user_id,
                clusters=[cluster],
                total_stories=len(stories),
                embedding_model="basic",
                generated_at=datetime.now()
            )

    async def generate_personalized_answer(
        self,
        user_id: str,
        question: str,
        company_context: str = None,
        role_context: str = None
    ) -> Dict[str, Any]:
        """Generate personalized answer using user's profile and story bank"""

        # Get user's profile and story brain
        profile = self.storage.get_profile(user_id)
        if not profile:
            raise ValueError("User profile not found")

        personality_snapshot = profile.get("personality_snapshot")
        if not personality_snapshot:
            raise ValueError("Personality snapshot not found")

        # Get story brain (or generate if not exists)
        story_brain_data = profile.get("story_brain")
        if not story_brain_data:
            story_brain = await self.generate_story_brain(user_id)
            # Save to profile
            profile["story_brain"] = story_brain.dict()
            self.storage.save_profile(user_id, profile)
        else:
            story_brain = StoryBrain(**story_brain_data)

        # Route question to best story
        stories = []
        for cluster in story_brain.clusters:
            stories.extend([story.dict() for story in cluster.stories])

        routing = await ai_service.route_question(
            question=question,
            stories=stories,
            context=f"{company_context or ''} {role_context or ''}".strip()
        )

        # Get selected story
        selected_story = None
        if routing.get("matched_story_id"):
            for story in stories:
                if story.get("story_id") == routing["matched_story_id"]:
                    selected_story = story
                    break

        if not selected_story:
            selected_story = stories[0] if stories else {}

        # Generate personalized answer
        context = f"Company: {company_context}\nRole: {role_context}" if company_context or role_context else ""

        system_prompt, user_prompt = personalized_answer_prompts.get_personalized_answer_prompts(
            question=question,
            context=context,
            personality_profile=personality_snapshot,
            story_bank=stories,
            selected_story=selected_story
        )

        # Generate answer using configured model
        model_config = self._get_model_config("PERSONALIZED_ANSWER_MODEL")
        response = await self.ai_service.generate_completion(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=model_config.get("temperature", 0.6),
            max_tokens=model_config.get("max_tokens", 2000)
        )

        # Parse and structure response
        try:
            answer_data = json.loads(response)

            return {
                "routing": routing,
                "answer": {
                    "question": question,
                    "story_id": routing.get("matched_story_id"),
                    "answer_text": answer_data.get("answer", response),
                    "structure": answer_data.get("structure", "STAR"),
                    "estimated_time_seconds": answer_data.get("estimated_time_seconds", 60),
                    "key_points": answer_data.get("key_points", [])
                },
                "tone_match_score": answer_data.get("tone_match_score", 0.8),
                "personalization_factors": answer_data.get("personalization_factors", [])
            }

        except Exception as e:
            # Fallback structure
            return {
                "routing": routing,
                "answer": {
                    "question": question,
                    "story_id": routing.get("matched_story_id"),
                    "answer_text": response,
                    "structure": "STAR",
                    "estimated_time_seconds": 60,
                    "key_points": ["Personalized response generated"]
                },
                "tone_match_score": 0.7,
                "personalization_factors": ["Adapted to communication style"]
            }

    def _get_model_config(self, model_key: str) -> Dict[str, Any]:
        """Get model configuration for a specific task"""
        model_name = getattr(settings, model_key, "gemini")

        if model_name == "gemini":
            return {
                "model": "gemini",
                "temperature": settings.TEMPERATURE,
                "max_tokens": settings.MAX_TOKENS
            }
        elif model_name == "claude-sonnet":
            return {
                "model": "claude-sonnet",
                "temperature": settings.TEMPERATURE,
                "max_tokens": settings.MAX_TOKENS
            }
        elif model_name == "claude-haiku":
            return {
                "model": "claude-haiku",
                "temperature": 0.3,  # Lower temperature for faster model
                "max_tokens": settings.MAX_TOKENS
            }
        else:
            # Default to Gemini
            return {
                "model": "gemini",
                "temperature": settings.TEMPERATURE,
                "max_tokens": settings.MAX_TOKENS
            }


# Global instance
mvp_service = MVPService()
