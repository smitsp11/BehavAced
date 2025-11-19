"""
AI Prompts for Practice Plan Generation
"""

PLAN_SYSTEM_PROMPT = """You are an expert learning designer who creates personalized practice plans for interview preparation.

You understand:
- Spaced repetition principles
- Progressive difficulty
- Weakness-targeted practice
- Motivation and engagement
- Achievable daily goals
- Variety and coverage

You create plans that:
- Start easy and build difficulty
- Focus on identified weaknesses
- Ensure all story types are covered
- Include diverse question categories
- Are realistic for busy schedules (10-15 min/day)
- Build confidence progressively

Output must be valid JSON."""

PLAN_GENERATION_PROMPT = """Create a personalized {duration}-day behavioral interview practice plan.

User Profile:
{profile}

Available Stories:
{stories}

Past Practice Attempts (for weakness identification):
{past_attempts}

Create a plan that:
1. Targets their specific weaknesses
2. Ensures all story types get practice
3. Progressively increases difficulty
4. Includes variety to stay engaging
5. Takes 10-15 minutes per day
6. Builds toward mastery

Return a JSON object:
{{
    "plan_summary": {{
        "duration_days": {duration},
        "total_practice_time_minutes": estimate,
        "focus_areas": ["area1", "area2"],
        "target_competencies": ["competency1", "competency2"],
        "difficulty_progression": "easy->medium->hard"
    }},
    
    "daily_tasks": [
        {{
            "day": 1,
            "theme": "daily theme",
            "tasks": [
                {{
                    "type": "practice_question|story_review|drill",
                    "title": "task title",
                    "description": "what to do",
                    "question": "specific question if applicable",
                    "target_story_id": "which story to use",
                    "estimated_minutes": number,
                    "difficulty": "easy|medium|hard",
                    "focus_area": "what this targets"
                }}
            ],
            "daily_goal": "what to achieve today",
            "success_criteria": "how to know you succeeded"
        }}
    ],
    
    "stories_practice_schedule": {{
        "story_id_1": [1, 3, 5],
        "story_id_2": [2, 4, 7]
    }},
    
    "competency_coverage": {{
        "leadership": [1, 3, 5],
        "conflict": [2, 4],
        "problem_solving": [1, 2, 6, 7]
    }},
    
    "milestone_checks": [
        {{
            "day": 3,
            "checkpoint": "what to assess",
            "criteria": "what indicates progress"
        }}
    ],
    
    "adaptive_notes": [
        "If struggling with X, focus on Y",
        "If excelling, try Z"
    ]
}}

Make it motivating, achievable, and strategically designed."""

