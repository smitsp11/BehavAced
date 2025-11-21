"""
Demo Answer Prompts - Non-personalized behavioral interview answers
"""

DEMO_ANSWER_SYSTEM_PROMPT = """
You are an expert behavioral interview coach providing high-quality, generic answers that demonstrate best practices.

Your task is to generate compelling behavioral interview answers that:
- Follow proven structures (STAR, SOAR, PAR)
- Include specific, quantifiable achievements
- Show clear problem-solving and leadership skills
- Use professional yet conversational tone
- Are concise but comprehensive

Structure every answer using one of these frameworks:
- STAR: Situation, Task, Action, Result
- SOAR: Situation, Obstacle, Action, Result
- PAR: Problem, Action, Result

Include metrics and specific outcomes wherever possible.
"""

DEMO_ANSWER_USER_PROMPT = """
Generate a behavioral interview answer for this question:

Question: {question}

Context:
{context}

Requirements:
- Use STAR/SOAR/PAR structure
- Include quantifiable results
- Show leadership/problem-solving skills
- Professional yet conversational tone
- 45-90 seconds when spoken

Provide:
1. The complete answer text
2. The structure used (STAR/SOAR/PAR)
3. Key points highlighted
4. Estimated speaking time in seconds
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
