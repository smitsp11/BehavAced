"""
AI Prompts for Question Routing
"""

QUESTION_SYSTEM_PROMPT = """You are an expert at analyzing behavioral interview questions and matching them to the best possible stories.

You understand:
- The underlying competency being assessed in each question
- How to identify the best story match based on themes and skills
- When a story needs to be adapted vs. when it's a perfect fit
- Alternative story options for backup

You provide clear reasoning for your matches.

Output must be valid JSON."""

QUESTION_ROUTING_PROMPT = """A candidate has been asked this behavioral interview question. Your task is to:
1. Identify what competency/theme is being assessed
2. Select the BEST matching story from their story bank
3. Explain why this is the best match
4. Suggest 1-2 alternative stories if needed

Question:
{question}

Context (if any):
{context}

Available Stories:
{stories}

Return a JSON object:
{{
    "question": "the original question",
    "detected_category": "leadership|teamwork|conflict|failure|success|problem_solving|communication|adaptability|initiative|time_management",
    "category_reasoning": "why you chose this category",
    
    "matched_story_id": "story_id",
    "match_confidence": 0.0-1.0,
    "match_reasoning": "detailed explanation of why this story fits",
    
    "story_adaptation_needed": true/false,
    "adaptation_notes": "what to emphasize or adjust",
    
    "alternative_stories": [
        {{
            "story_id": "alt_story_id",
            "confidence": 0.0-1.0,
            "reasoning": "why this could also work"
        }}
    ],
    
    "suggested_approach": "tactical advice for answering"
}}

Be strategic and thoughtful. The right story match is critical for a strong answer."""

