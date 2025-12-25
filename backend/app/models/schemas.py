"""
Pydantic Models for API Request/Response
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class PersonalityTraits(str, Enum):
    """Personality dimensions"""
    ANALYTICAL = "analytical"
    CREATIVE = "creative"
    DETAIL_ORIENTED = "detail_oriented"
    BIG_PICTURE = "big_picture"
    COLLABORATIVE = "collaborative"
    INDEPENDENT = "independent"
    ASSERTIVE = "assertive"
    DIPLOMATIC = "diplomatic"


class CommunicationStyle(BaseModel):
    """User's communication style profile"""
    vocabulary_level: str = Field(default="moderate", description="simple, moderate, advanced")
    sentence_complexity: str = Field(default="medium", description="short, medium, complex")
    tone: str = Field(default="conversational", description="formal, conversational, enthusiastic")
    pace: str = Field(default="moderate", description="slow, moderate, fast")
    detail_preference: str = Field(default="balanced", description="high-level, balanced, detailed")
    storytelling_style: str = Field(default="narrative", description="direct, narrative, reflective")


class UserProfile(BaseModel):
    """Complete user cognitive profile"""
    user_id: str
    personality_traits: List[PersonalityTraits] = Field(default_factory=list)
    communication_style: Optional[CommunicationStyle] = None
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    confidence_level: int = Field(default=5, ge=1, le=10)
    experience_level: str = Field(default="entry", description="student, entry, mid, senior")
    created_at: datetime = Field(default_factory=datetime.now)


class Story(BaseModel):
    """A behavioral interview story"""
    story_id: str
    title: str
    situation: str
    task: str
    actions: List[str]
    result: str
    reflection: Optional[str] = None
    
    # Metadata
    themes: List[str] = Field(..., description="leadership, conflict, failure, growth, etc.")
    competencies: List[str] = Field(..., description="teamwork, problem-solving, communication, etc.")
    emotional_arc: str = Field(..., description="challenge->resolution, failure->learning, etc.")
    impact_level: int = Field(..., ge=1, le=10)
    
    # Versions
    star_version: str
    soar_version: str
    compressed_version: str
    detailed_version: str


class QuestionCategory(str, Enum):
    """Behavioral question categories"""
    LEADERSHIP = "leadership"
    TEAMWORK = "teamwork"
    CONFLICT = "conflict"
    FAILURE = "failure"
    SUCCESS = "success"
    PROBLEM_SOLVING = "problem_solving"
    COMMUNICATION = "communication"
    ADAPTABILITY = "adaptability"
    INITIATIVE = "initiative"
    TIME_MANAGEMENT = "time_management"


class BehavioralQuestion(BaseModel):
    """A behavioral interview question"""
    question: str
    category: Optional[QuestionCategory] = None
    company_context: Optional[str] = None
    role_context: Optional[str] = None


class QuestionRouting(BaseModel):
    """Question routing result"""
    question: str
    detected_category: QuestionCategory
    matched_story_id: str
    match_confidence: float = Field(..., ge=0, le=1)
    reasoning: str
    alternative_stories: Optional[List[str]] = None


class GeneratedAnswer(BaseModel):
    """Generated answer to behavioral question"""
    question: str
    story_id: str
    answer_text: str
    structure: str = Field(..., description="STAR, SOAR, PAR")
    estimated_time_seconds: int
    key_points: List[str]
    tone_match: float = Field(..., ge=0, le=1)


class PracticeAttempt(BaseModel):
    """User's practice attempt"""
    attempt_id: str
    question: str
    transcript: str
    audio_duration_seconds: float
    
    # Scores
    clarity_score: int = Field(..., ge=0, le=100)
    structure_score: int = Field(..., ge=0, le=100)
    confidence_score: int = Field(..., ge=0, le=100)
    pacing_score: int = Field(..., ge=0, le=100)
    overall_score: int = Field(..., ge=0, le=100)
    
    # Analysis
    filler_words_count: int
    filler_words: Dict[str, int]
    missing_elements: List[str]
    strengths: List[str]
    improvements: List[str]
    
    created_at: datetime = Field(default_factory=datetime.now)


class ImprovedAnswer(BaseModel):
    """AI-improved version of user's answer"""
    original_transcript: str
    improved_version: str
    changes_made: List[str]
    coaching_tips: List[str]


class PracticePlan(BaseModel):
    """Personalized practice plan"""
    plan_id: str
    user_id: str
    duration_days: int = 7
    
    daily_tasks: List[Dict[str, Any]]
    focus_areas: List[str]
    target_competencies: List[QuestionCategory]
    stories_to_strengthen: List[str]
    
    created_at: datetime = Field(default_factory=datetime.now)


# Request Models
class ResumeUploadRequest(BaseModel):
    """Request for resume upload"""
    file_content: str = Field(..., description="Base64 encoded file content")
    file_name: str
    file_type: str = Field(..., description="pdf, docx, txt")


class PersonalityQuestionnaireRequest(BaseModel):
    """Personality questionnaire responses"""
    responses: Dict[str, Any]
    writing_sample: Optional[str] = None


class QuestionRequest(BaseModel):
    """Request to answer a behavioral question"""
    user_id: str
    question: str
    company_context: Optional[str] = None
    role_context: Optional[str] = None


class PracticeRequest(BaseModel):
    """Request to score a practice attempt"""
    user_id: str
    question: str
    audio_base64: Optional[str] = None
    transcript: Optional[str] = None
    duration_seconds: float


class PlanRequest(BaseModel):
    """Request to generate practice plan"""
    user_id: str
    duration_days: int = 7
    focus_areas: Optional[List[str]] = None


# Response Models
class ProfileResponse(BaseModel):
    """Response after profile creation"""
    success: bool
    user_id: str
    profile: Optional[UserProfile] = None
    message: str


class StoriesResponse(BaseModel):
    """Response with extracted stories"""
    success: bool
    user_id: str
    stories: List[Story]
    total_count: int


class AnswerResponse(BaseModel):
    """Response with generated answer"""
    success: bool
    routing: QuestionRouting
    answer: GeneratedAnswer


class PracticeResponse(BaseModel):
    """Response after practice scoring"""
    success: bool
    attempt: PracticeAttempt
    improved_answer: ImprovedAnswer


class PlanResponse(BaseModel):
    """Response with practice plan"""
    success: bool
    plan: PracticePlan


# PHASE 1 - MVP API Models

class DemoAnswerRequest(BaseModel):
    """Request for demo answer generation (non-personalized)"""
    question: str
    company_context: Optional[str] = None
    role_context: Optional[str] = None
    industry: Optional[str] = None


class DemoAnswerResponse(BaseModel):
    """Response with demo answer"""
    success: bool
    answer: str
    structure: str = Field(..., description="STAR, SOAR, PAR")
    key_points: List[str]
    estimated_time_seconds: int


class PersonalitySnapshotRequest(BaseModel):
    """Request for personality snapshot analysis"""
    user_id: str
    responses: Dict[str, Any]
    writing_sample: Optional[str] = None


class PersonalitySnapshot(BaseModel):
    """Personality snapshot with embeddings"""
    traits: List[PersonalityTraits]
    communication_style: CommunicationStyle
    strengths: List[str]
    weaknesses: List[str]
    confidence_level: int = Field(..., ge=1, le=10)
    embedding: List[float]  # Vector embedding for similarity matching
    tone_profile: Dict[str, Any]  # Tone modeling data


class PersonalitySnapshotResponse(BaseModel):
    """Response with personality snapshot"""
    success: bool
    user_id: str
    snapshot: PersonalitySnapshot
    message: str


class ManualExperienceEntry(BaseModel):
    """Single manual experience entry"""
    role_title: str
    company: str
    location: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    description: str
    achievements: List[str]
    skills_used: List[str] = Field(default_factory=list)


class ManualExperienceRequest(BaseModel):
    """Request for manual experience input"""
    user_id: str
    experiences: List[ManualExperienceEntry]
    education: Optional[Dict[str, Any]] = None
    additional_skills: List[str] = Field(default_factory=list)


class ManualExperienceResponse(BaseModel):
    """Response after processing manual experience"""
    success: bool
    user_id: str
    processed_experiences: List[Dict[str, Any]]
    extracted_stories: List[Dict[str, Any]]
    message: str


class StoryBrainGenerateRequest(BaseModel):
    """Request to generate story-brain (story bank)"""
    user_id: str


class StoryCluster(BaseModel):
    """A cluster of related stories"""
    cluster_id: str
    theme: str
    competency: str
    stories: List[Story]
    confidence: float


class StoryBrain(BaseModel):
    """Generated story-brain (bank of clustered stories)"""
    user_id: str
    clusters: List[StoryCluster]
    total_stories: int
    embedding_model: str
    generated_at: datetime


class StoryBrainResponse(BaseModel):
    """Response with generated story-brain"""
    success: bool
    story_brain: StoryBrain
    message: str


class PersonalizedAnswerRequest(BaseModel):
    """Request for personalized answer generation"""
    user_id: str
    question: str
    company_context: Optional[str] = None
    role_context: Optional[str] = None


class PersonalizedAnswerResponse(BaseModel):
    """Response with personalized answer"""
    success: bool
    routing: QuestionRouting
    answer: GeneratedAnswer
    tone_match_score: float = Field(..., ge=0, le=1)
    personalization_factors: List[str]

