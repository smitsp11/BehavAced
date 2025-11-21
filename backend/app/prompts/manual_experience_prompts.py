"""
Manual Experience Prompts - Process manually entered experience data
"""

EXPERIENCE_PROCESSING_SYSTEM_PROMPT = """
You are an expert resume writer and behavioral interview coach specializing in extracting compelling stories from work experience.

Your task is to:
1. Process manually entered work experiences
2. Extract quantifiable achievements and key accomplishments
3. Identify leadership and problem-solving examples
4. Create behavioral interview story candidates
5. Tag experiences with relevant competencies and themes

For each experience, focus on:
- Role context and responsibilities
- Quantifiable achievements (metrics, percentages, dollar amounts)
- Leadership and team management examples
- Technical skills and tools used
- Problem-solving and innovation examples
- Impact and results achieved

Create story candidates that follow behavioral interview best practices.
"""

EXPERIENCE_PROCESSING_USER_PROMPT = """
Process these manually entered work experiences and extract behavioral interview stories:

Experiences:
{experiences}

Additional Skills:
{additional_skills}

Please provide:

1. **Processed Experiences** (enhanced with analysis):
   - Original data plus extracted insights
   - Quantified achievements identified
   - Key competencies demonstrated

2. **Story Candidates** (for behavioral interviews):
   - Situation/Task context
   - Actions taken
   - Results achieved
   - STAR/SOAR framework elements
   - Relevant competencies (leadership, problem-solving, etc.)
   - Themes (success, failure, growth, conflict, etc.)

3. **Skills Analysis**:
   - Technical skills identified
   - Soft skills demonstrated
   - Leadership capabilities shown

Format as JSON with clear structure for each experience and story.
"""

def get_experience_processing_prompts(experiences: list, additional_skills: list = None) -> tuple:
    """Get formatted prompts for manual experience processing"""

    # Format experiences for prompt
    formatted_experiences = []
    for i, exp in enumerate(experiences, 1):
        formatted_exp = f"""
Experience {i}:
Role: {exp.get('role_title', '')}
Company: {exp.get('company', '')}
Location: {exp.get('location', 'N/A')}
Dates: {exp.get('start_date', '')} - {exp.get('end_date', 'Present')}
Description: {exp.get('description', '')}
Achievements: {', '.join(exp.get('achievements', []))}
Skills Used: {', '.join(exp.get('skills_used', []))}
"""
        formatted_experiences.append(formatted_exp)

    experiences_text = "\n".join(formatted_experiences)
    skills_text = ", ".join(additional_skills) if additional_skills else "None specified"

    system_prompt = EXPERIENCE_PROCESSING_SYSTEM_PROMPT
    user_prompt = EXPERIENCE_PROCESSING_USER_PROMPT.format(
        experiences=experiences_text,
        additional_skills=skills_text
    )

    return system_prompt, user_prompt
