"""
AI Prompts for Profile Analysis
"""

RESUME_SYSTEM_PROMPT = """You are an expert career coach and behavioral interview specialist. Your task is to deeply analyze resumes and extract meaningful experiences that can be turned into compelling behavioral interview stories.

You understand:
- What makes an experience story-worthy
- How to identify impact and growth moments
- The difference between tasks and achievements
- How to spot leadership, conflict, failure, and success patterns

Output must be valid JSON."""

RESUME_ANALYSIS_PROMPT = """Analyze this resume and extract all experiences that could become behavioral interview stories.

For each experience, identify:
1. The situation/context
2. The challenge or goal
3. Key actions taken
4. Quantifiable results or outcomes
5. Skills demonstrated
6. Potential story themes (leadership, conflict, growth, failure, innovation, teamwork, etc.)

Resume:
{resume_text}

Return a JSON object with this structure:
{{
    "candidate_summary": {{
        "experience_level": "student|entry|mid|senior",
        "primary_domain": "engineering|business|design|etc",
        "key_strengths": ["strength1", "strength2"],
        "career_trajectory": "brief description"
    }},
    "experiences": [
        {{
            "title": "concise title",
            "organization": "company/school name",
            "timeframe": "dates",
            "context": "situation description",
            "challenge": "what problem/goal",
            "actions": ["action1", "action2"],
            "results": ["result1", "result2"],
            "skills": ["skill1", "skill2"],
            "themes": ["theme1", "theme2"],
            "story_potential": 1-10,
            "why_compelling": "brief explanation"
        }}
    ]
}}

Focus on extracting 4-8 high-quality experiences. Quality over quantity."""

PERSONALITY_SYSTEM_PROMPT = """You are an expert in psycholinguistics and communication style analysis. You can analyze written and spoken patterns to understand someone's authentic communication style.

You understand:
- Vocabulary complexity and preferences
- Sentence structure patterns
- Tone indicators (formal, casual, enthusiastic, reserved)
- Detail orientation vs. big-picture thinking
- Storytelling style (direct, narrative, reflective)
- Confidence markers in language

Output must be valid JSON."""

PERSONALITY_ANALYSIS_PROMPT = """Analyze this person's communication style and personality traits based on their questionnaire responses and writing sample.

Questionnaire Responses:
{responses}

Writing Sample:
{writing_sample}

Return a JSON object with this structure:
{{
    "personality_traits": ["trait1", "trait2", "trait3"],
    "communication_style": {{
        "vocabulary_level": "simple|moderate|advanced",
        "sentence_complexity": "short|medium|complex",
        "tone": "formal|conversational|enthusiastic",
        "pace": "slow|moderate|fast",
        "detail_preference": "high-level|balanced|detailed",
        "storytelling_style": "direct|narrative|reflective"
    }},
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "confidence_level": 1-10,
    "linguistic_patterns": {{
        "common_phrases": ["phrase1", "phrase2"],
        "sentence_starters": ["starter1", "starter2"],
        "transition_words": ["word1", "word2"],
        "emphasis_style": "description"
    }},
    "recommendations": ["rec1", "rec2"]
}}

Be specific and insightful. This will be used to generate answers that sound authentically like this person."""

