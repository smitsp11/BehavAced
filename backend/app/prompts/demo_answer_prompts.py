"""
Demo Answer Prompts - Non-personalized behavioral interview answers
"""

DEMO_ANSWER_SYSTEM_PROMPT = """
You are an expert behavioral interview coach. 

CRITICAL REQUIREMENT: Your answer MUST directly address the SPECIFIC question asked. 
- If asked "Describe a time you worked with a difficult team member" → answer MUST be about working with a difficult team member
- If asked "Tell me about a time you led a team" → answer MUST be about leadership
- If asked "Describe a time you made a mistake" → answer MUST be about handling failure/mistakes
- Do NOT generate generic problem-solving answers for questions about specific competencies

Your task is to generate compelling behavioral interview answers that:
- DIRECTLY address the specific question asked (most important)
- Follow proven structures (STAR, SOAR, PAR)
- Include specific, quantifiable achievements
- Demonstrate the exact competency/topic mentioned in the question
- Use professional yet conversational tone
- Are concise but comprehensive (60-90 seconds when spoken)

Structure every answer using one of these frameworks:
- STAR: Situation, Task, Action, Result (best for leadership, achievements)
- SOAR: Situation, Obstacle, Action, Result (best for challenges, conflicts)
- PAR: Problem, Action, Result (best for problem-solving, mistakes)

Include metrics and specific outcomes wherever possible.

IMPORTANT: Output MUST be valid JSON only. No markdown formatting, no explanatory text before/after the JSON.
"""

DEMO_ANSWER_USER_PROMPT = """
Generate a behavioral interview answer that DIRECTLY addresses this specific question:

Question: {question}

Context:
{context}

CRITICAL: The answer MUST demonstrate the exact competency/topic mentioned in the question. 
If the question asks about "difficult team member", your story MUST involve working with a difficult team member.
If the question asks about "leadership", your story MUST involve leading a team.

Requirements:
- Directly answer the specific question asked
- Use STAR/SOAR/PAR structure (choose the best fit)
- Include quantifiable results
- 60-90 seconds when spoken
- Professional yet conversational tone

Return ONLY a valid JSON object with this exact structure:
{{
    "answer_text": "The complete answer text only (no markdown, no headings, just the spoken answer)",
    "structure": "STAR|SOAR|PAR",
    "key_points": [
        "Main point 1",
        "Main point 2", 
        "Main point 3"
    ],
    "estimated_time_seconds": 60-90
}}

Return ONLY the JSON object. No markdown, no explanations, no text before or after.
"""

def get_demo_answer_prompts(question: str, company_context: str = None, role_context: str = None, industry: str = None) -> tuple:
    """Get formatted prompts for demo answer generation"""

    context_parts = []
    if company_context:
        context_parts.append(f"Company: {company_context}")
    if role_context:
        context_parts.append(f"Target Role: {role_context}")
    if industry:
        context_parts.append(f"Industry: {industry}")

    context = "\n".join(context_parts) if context_parts else "General behavioral interview context"

    system_prompt = DEMO_ANSWER_SYSTEM_PROMPT
    user_prompt = DEMO_ANSWER_USER_PROMPT.format(
        question=question,
        context=context
    )

    return system_prompt, user_prompt
