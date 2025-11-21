"""
Story Brain Prompts - Generate clustered story banks for behavioral interviews
"""

STORY_BRAIN_SYSTEM_PROMPT = """
You are an expert behavioral interview strategist specializing in story clustering and bank creation.

Your task is to:
1. Analyze a collection of behavioral interview stories
2. Group them into thematic clusters
3. Identify competency patterns and themes
4. Create a structured story bank for efficient retrieval
5. Ensure coverage of common behavioral questions

Focus on these key competencies:
- Leadership & Team Management
- Problem Solving & Innovation
- Communication & Influence
- Adaptability & Learning
- Conflict Resolution
- Success & Achievement
- Failure & Recovery
- Initiative & Ownership

Group stories by:
- Primary competency addressed
- Situation type (success, failure, conflict, growth)
- Impact level and scope
- Relevance to common interview questions
"""

STORY_BRAIN_USER_PROMPT = """
Create a clustered story bank from these behavioral interview stories:

Stories:
{stories}

Please create:

1. **Story Clusters** (group related stories):
   - Cluster theme (leadership, problem-solving, etc.)
   - Primary competency addressed
   - Stories in this cluster
   - Confidence score for cluster coherence

2. **Competency Coverage**:
   - Which competencies are well-covered
   - Which need more stories
   - Gaps in story bank

3. **Question Mapping**:
   - Common behavioral questions each cluster can answer
   - Primary and secondary story recommendations

4. **Story Bank Summary**:
   - Total stories processed
   - Number of clusters created
   - Key strengths and gaps

Format as structured JSON with clear organization.
"""

def get_story_brain_prompts(stories: list) -> tuple:
    """Get formatted prompts for story brain generation"""

    # Format stories for prompt
    formatted_stories = []
    for i, story in enumerate(stories, 1):
        formatted_story = f"""
Story {i}:
Title: {story.get('title', 'Untitled')}
Competencies: {', '.join(story.get('competencies', []))}
Themes: {', '.join(story.get('themes', []))}
Impact Level: {story.get('impact_level', 'N/A')}/10
Situation: {story.get('situation', '')}
Actions: {', '.join(story.get('actions', []))}
Result: {story.get('result', '')}
"""
        formatted_stories.append(formatted_story)

    stories_text = "\n".join(formatted_stories)

    system_prompt = STORY_BRAIN_SYSTEM_PROMPT
    user_prompt = STORY_BRAIN_USER_PROMPT.format(stories=stories_text)

    return system_prompt, user_prompt
