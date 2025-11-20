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

CRITICAL: You MUST respond with ONLY valid JSON. No prose, no explanations, no markdown formatting. Just pure, valid JSON that can be parsed directly."""

STORY_EXTRACTION_PROMPT = """Transform these resume experiences into polished behavioral interview stories.

Experiences:
{experiences}

Personality Profile:
{personality}

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON - no prose, explanations, or markdown
2. Keep story text concise (max 100 words per version)
3. Escape all quotes and special characters properly
4. Generate 3-5 stories maximum
5. Do NOT include line breaks within string values

Return this exact JSON structure (keep strings short):
{{
    "stories": [
        {{
            "story_id": "unique_id",
            "title": "brief title",
            "situation": "context in 1-2 sentences",
            "task": "challenge in 1 sentence",
            "actions": ["action1", "action2", "action3"],
            "result": "outcome with metrics",
            "reflection": "learning in 1 sentence",
            "themes": ["leadership", "problem-solving"],
            "competencies": ["teamwork", "communication"],
            "emotional_arc": "challenge to resolution",
            "impact_level": 7,
            "star_version": "Complete STAR story in 50-80 words",
            "soar_version": "Complete SOAR story in 50-80 words",
            "compressed_version": "Brief version in 30-40 words",
            "detailed_version": "Detailed version in 100-120 words"
        }}
    ]
}}

Keep all text concise and properly escaped for JSON. Generate 3-5 high-quality stories."""

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

