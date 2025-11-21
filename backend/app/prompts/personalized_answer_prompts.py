"""
Personalized Answer Prompts - Generate tailored behavioral interview answers
"""
import json

PERSONALIZED_ANSWER_SYSTEM_PROMPT = """
You are an expert behavioral interview coach creating highly personalized answers that match the candidate's authentic communication style and story bank.

Your task is to:
1. Select the most relevant story from the candidate's story bank
2. Adapt the answer to match their personality and communication style
3. Use their authentic voice and tone preferences
4. Incorporate their specific examples and achievements
5. Maintain consistency with their demonstrated communication patterns

Key personalization factors:
- Match vocabulary level (simple, moderate, advanced)
- Use preferred sentence complexity (short, medium, complex)
- Adopt their tone (formal, conversational, enthusiastic)
- Follow their pacing preferences (slow, moderate, fast)
- Include appropriate detail level (high-level, balanced, detailed)
- Use their storytelling style (direct, narrative, reflective)
"""

PERSONALIZED_ANSWER_USER_PROMPT = """
Generate a personalized behavioral interview answer using this candidate's profile:

Question: {question}

Context:
{context}

Candidate Profile:
{personality_profile}

Story Bank (select most relevant):
{story_bank}

Selected Story:
{selected_story}

Generate an answer that:
- Uses the candidate's authentic communication style
- Incorporates their specific story and achievements
- Matches their tone and personality
- Follows STAR/SOAR structure
- Includes quantifiable results
- Sounds natural when spoken by the candidate

Provide:
1. Complete personalized answer
2. Structure used (STAR/SOAR/PAR)
3. Key points highlighted
4. Estimated speaking time
5. Tone match score (0-1)
6. Personalization factors applied
"""

def get_personalized_answer_prompts(
    question: str,
    context: str,
    personality_profile: dict,
    story_bank: list,
    selected_story: dict
) -> tuple:
    """Get formatted prompts for personalized answer generation"""

    system_prompt = PERSONALIZED_ANSWER_SYSTEM_PROMPT
    user_prompt = PERSONALIZED_ANSWER_USER_PROMPT.format(
        question=question,
        context=context,
        personality_profile=json.dumps(personality_profile, indent=2),
        story_bank=json.dumps(story_bank, indent=2),
        selected_story=json.dumps(selected_story, indent=2)
    )

    return system_prompt, user_prompt
