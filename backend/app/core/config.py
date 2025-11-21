"""
Configuration and Settings
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""
    
    # API Keys
    GOOGLE_API_KEY: str  # Google Gemini API key
    CLAUDE_API_KEY: Optional[str] = None  # Claude/Anthropic API key (optional)
    OPENAI_API_KEY: Optional[str] = None
    
    # Database
    DATABASE_URL: Optional[str] = None
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    
    # Application
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    
    # AI Model - Primary (Gemini)
    GEMINI_MODEL: str = "gemini-2.5-flash"  # Google Gemini model
    MAX_TOKENS: int = 8192  # Gemini supports higher token limits
    TEMPERATURE: float = 0.7

    # Claude/Anthropic models (for optional use)
    CLAUDE_API_KEY: Optional[str] = None
    CLAUDE_SONNET_MODEL: str = "claude-3-5-sonnet-20241022"
    CLAUDE_HAIKU_MODEL: str = "claude-3-5-haiku-20241022"

    # Model selection per task (PHASE 1)
    # Options: "gemini", "claude-sonnet", "claude-haiku"
    DEMO_ANSWER_MODEL: str = "gemini"
    PERSONALITY_EMBED_MODEL: str = "gemini"
    MANUAL_EXPERIENCE_MODEL: str = "gemini"
    STORY_BRAIN_MODEL: str = "gemini"
    PERSONALIZED_ANSWER_MODEL: str = "gemini"
    RESUME_ANALYSIS_MODEL: str = "gemini"
    QUESTION_ROUTING_MODEL: str = "gemini"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

