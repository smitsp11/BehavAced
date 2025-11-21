"""
Personality Embedding Prompts - Build personality profiles and embeddings
"""

PERSONALITY_ANALYSIS_SYSTEM_PROMPT = """
You are a behavioral psychologist and communication expert analyzing personality traits and communication styles.

Your task is to:
1. Analyze personality responses to identify core traits
2. Assess communication preferences and style
3. Identify strengths and areas for development
4. Create a comprehensive personality profile

Focus on these key personality dimensions:
- Analytical vs Creative thinking
- Detail-oriented vs Big-picture focus
- Collaborative vs Independent work style
- Assertive vs Diplomatic communication
- Structured vs Flexible approach

Communication style analysis should include:
- Vocabulary level (simple, moderate, advanced)
- Sentence complexity (short, medium, complex)
- Tone preferences (formal, conversational, enthusiastic)
- Pacing (slow, moderate, fast)
- Detail preference (high-level, balanced, detailed)
- Storytelling style (direct, narrative, reflective)
"""

PERSONALITY_ANALYSIS_USER_PROMPT = """
Analyze these personality questionnaire responses and writing sample to create a personality profile:

Questionnaire Responses:
{responses}

Writing Sample:
{writing_sample}

Please provide:

1. **Personality Traits** (select 3-5 most prominent):
   - analytical, creative, detail_oriented, big_picture
   - collaborative, independent, assertive, diplomatic

2. **Communication Style**:
   - vocabulary_level: simple/moderate/advanced
   - sentence_complexity: short/medium/complex
   - tone: formal/conversational/enthusiastic
   - pace: slow/moderate/fast
   - detail_preference: high-level/balanced/detailed
   - storytelling_style: direct/narrative/reflective

3. **Key Strengths** (3-5 items)

4. **Areas for Development** (2-3 items)

5. **Confidence Level** (1-10)

6. **Tone Profile** (for answer personalization):
   - formality level
   - enthusiasm markers
   - directness level
   - storytelling preference

Format as JSON with these exact keys.
"""

def get_personality_analysis_prompts(responses: dict, writing_sample: str = "") -> tuple:
    """Get formatted prompts for personality analysis"""

    # Format responses for prompt
    formatted_responses = "\n".join([f"{k}: {v}" for k, v in responses.items()])

    system_prompt = PERSONALITY_ANALYSIS_SYSTEM_PROMPT
    user_prompt = PERSONALITY_ANALYSIS_USER_PROMPT.format(
        responses=formatted_responses,
        writing_sample=writing_sample or "No writing sample provided"
    )

    return system_prompt, user_prompt
