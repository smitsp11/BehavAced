"""
Configuration and Settings
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""
    
    # API Keys
    # Claude/Anthropic (commented out - using Gemini instead)
    # ANTHROPIC_API_KEY: str
    GOOGLE_API_KEY: str  # Google Gemini API key
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
    
    # AI Model
    # Claude model (commented out - using Gemini instead)
    # CLAUDE_MODEL: str = "claude-3-5-sonnet-20241022"
    GEMINI_MODEL: str = "gemini-2.5-flash"  # Google Gemini model
    MAX_TOKENS: int = 8192  # Gemini supports higher token limits
    TEMPERATURE: float = 0.7
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

