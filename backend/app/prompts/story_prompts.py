"""
AI Prompts for Story Extraction and Generation
"""

STORY_SYSTEM_PROMPT = """You are a master storyteller and behavioral interview coach. You excel at transforming raw experiences into compelling, structured interview stories.

You understand:
- STAR (Situation, Task, Action, Result) framework
- SOAR (Situation, Obstacle, Action, Result) framework
- PAR (Problem, Action, Result) framework
- How to make stories memorable and impactful
- The importance of emotional arc and reflection
- How to adapt stories to different question types

Output must be valid JSON with complete, interview-ready stories."""

STORY_EXTRACTION_PROMPT = """Transform these resume experiences into polished behavioral interview stories.

Experiences:
{experiences}

Personality Profile:
{personality}

For each experience, create a complete story with:
1. Clear STAR structure
2. Multiple formatted versions (STAR, SOAR, compressed, detailed)
3. Identified themes and competencies
4. Emotional arc
5. Written in the candidate's authentic voice (use personality profile)

Return a JSON object:
{{
    "stories": [
        {{
            "story_id": "unique_id",
            "title": "brief memorable title",
            "situation": "context (2-3 sentences)",
            "task": "challenge/goal (1-2 sentences)",
            "actions": ["action1", "action2", "action3"],
            "result": "outcome with metrics if possible",
            "reflection": "what you learned or would do differently",
            
            "themes": ["leadership", "conflict", "growth", etc.],
            "competencies": ["problem-solving", "communication", etc.],
            "emotional_arc": "challenge->resolution",
            "impact_level": 1-10,
            
            "star_version": "complete 60-90 second answer",
            "soar_version": "complete answer emphasizing obstacles",
            "compressed_version": "30-45 second version",
            "detailed_version": "120+ second version with more context"
        }}
    ]
}}

Generate 4-8 diverse stories covering different themes. Each version should sound natural and conversational in the candidate's voice."""

STORY_REWRITE_PROMPT = """Rewrite this story to better match the user's authentic communication style.

Original Story:
{original_story}

Target Communication Style:
{communication_style}

Rewrite all versions (STAR, SOAR, compressed, detailed) to match:
- Vocabulary level
- Sentence complexity
- Tone and energy
- Detail preferences
- Natural speech patterns

Return the same JSON structure with improved versions that sound authentically like the user."""

