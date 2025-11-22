"""
System Interfaces for Future Implementation
Database persistence, caching, model selection, and dev optimizations
"""
from typing import Dict, List, Any, Optional, Protocol
from datetime import datetime
from dataclasses import dataclass
from enum import Enum

# ============================================================================
# DATABASE INTERFACES
# ============================================================================

class DatabaseType(Enum):
    SUPABASE = "supabase"
    POSTGRESQL = "postgresql"
    MONGODB = "mongodb"
    IN_MEMORY = "in_memory"

@dataclass
class DatabaseConfig:
    type: DatabaseType
    connection_string: Optional[str] = None
    schema: Optional[str] = None
    ssl: bool = True

@dataclass
class UserProfile:
    id: str
    user_id: str
    personality_snapshot: Optional[Dict[str, Any]] = None
    story_brain: Optional[Dict[str, Any]] = None
    manual_experience: Optional[Dict[str, Any]] = None
    onboarding_completed: bool = False
    created_at: datetime = None
    updated_at: datetime = None
    last_active_at: datetime = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow()
        if self.last_active_at is None:
            self.last_active_at = datetime.utcnow()

@dataclass
class PracticeSession:
    id: str
    user_id: str
    question: str
    transcript: str
    audio_url: Optional[str] = None
    scores: Dict[str, Any] = None
    feedback: Dict[str, Any] = None
    duration: float = 0.0
    created_at: datetime = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.scores is None:
            self.scores = {}
        if self.feedback is None:
            self.feedback = {}

@dataclass
class StoryBank:
    id: str
    user_id: str
    stories: List[Dict[str, Any]] = None
    clusters: List[Dict[str, Any]] = None
    embedding_model: str = "sentence-transformers"
    total_stories: int = 0
    created_at: datetime = None
    updated_at: datetime = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow()
        if self.stories is None:
            self.stories = []
        if self.clusters is None:
            self.clusters = []

class DatabaseAdapter(Protocol):
    """Protocol for database adapters"""

    async def save_user_profile(self, profile: UserProfile) -> None:
        """Save user profile"""
        ...

    async def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile by user_id"""
        ...

    async def update_user_profile(self, user_id: str, updates: Dict[str, Any]) -> None:
        """Update user profile"""
        ...

    async def save_practice_session(self, session: PracticeSession) -> None:
        """Save practice session"""
        ...

    async def get_practice_sessions(self, user_id: str, limit: int = 10) -> List[PracticeSession]:
        """Get user's practice sessions"""
        ...

    async def save_story_bank(self, story_bank: StoryBank) -> None:
        """Save story bank"""
        ...

    async def get_story_bank(self, user_id: str) -> Optional[StoryBank]:
        """Get user's story bank"""
        ...

# ============================================================================
# CACHE INTERFACES
# ============================================================================

class CacheType(Enum):
    MEMORY = "memory"
    REDIS = "redis"
    FILE = "file"
    NONE = "none"

@dataclass
class CacheConfig:
    type: CacheType
    ttl_seconds: int = 3600  # 1 hour default
    max_size: int = 1000
    namespace: str = "behavaced"

@dataclass
class CacheEntry:
    key: str
    value: Any
    expires_at: Optional[datetime] = None
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class CacheAdapter(Protocol):
    """Protocol for cache adapters"""

    async def get(self, key: str) -> Optional[Any]:
        """Get cached value"""
        ...

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set cached value"""
        ...

    async def delete(self, key: str) -> None:
        """Delete cached value"""
        ...

    async def clear(self) -> None:
        """Clear all cached values"""
        ...

    async def has(self, key: str) -> bool:
        """Check if key exists"""
        ...

    async def keys(self, pattern: str = "*") -> List[str]:
        """Get keys matching pattern"""
        ...

    async def size(self) -> int:
        """Get cache size"""
        ...

# ============================================================================
# MODEL SELECTION INTERFACES
# ============================================================================

class AIModel(Enum):
    GEMINI = "gemini"
    CLAUDE_SONNET = "claude-sonnet"
    CLAUDE_HAIKU = "claude-haiku"
    GPT4 = "gpt-4"
    GPT35_TURBO = "gpt-3.5-turbo"

@dataclass
class ModelConfig:
    provider: str  # 'google', 'anthropic', 'openai'
    model_name: str
    temperature: float
    max_tokens: int
    cost_per_token: Optional[float] = None
    supports_audio: bool = False
    supports_embeddings: bool = False
    supports_functions: bool = False

@dataclass
class TaskModelMapping:
    demo_answer: AIModel = AIModel.CLAUDE_HAIKU
    personality_analysis: AIModel = AIModel.CLAUDE_SONNET
    resume_processing: AIModel = AIModel.GEMINI
    story_generation: AIModel = AIModel.CLAUDE_SONNET
    answer_personalization: AIModel = AIModel.CLAUDE_SONNET
    practice_scoring: AIModel = AIModel.GEMINI
    audio_transcription: AIModel = AIModel.GEMINI  # Uses Whisper API

class ModelSelector(Protocol):
    """Protocol for model selection logic"""

    def select_model_for_task(self, task: str) -> AIModel:
        """Select appropriate model for task"""
        ...

    def get_model_config(self, model: AIModel) -> ModelConfig:
        """Get configuration for model"""
        ...

    def update_task_model(self, task: str, model: AIModel) -> None:
        """Update model for specific task"""
        ...

    def get_available_models(self) -> List[AIModel]:
        """Get list of available models"""
        ...

# ============================================================================
# DEV OPTIMIZATION INTERFACES
# ============================================================================

@dataclass
class DevConfig:
    enable_caching: bool = True
    enable_fixtures: bool = False
    mock_ai_responses: bool = False
    skip_onboarding: bool = False
    use_local_cache: bool = True
    enable_debug_logging: bool = False
    mock_audio_recording: bool = False
    fast_mode: bool = False

@dataclass
class FixtureData:
    demo_answers: Dict[str, Dict[str, Any]]
    personality_profiles: Dict[str, Dict[str, Any]]
    story_banks: Dict[str, List[Dict[str, Any]]]
    practice_sessions: Dict[str, List[Dict[str, Any]]]
    resume_samples: Dict[str, str]

class DevTools(Protocol):
    """Protocol for development tools"""

    def load_fixtures(self) -> None:
        """Load fixture data for testing"""
        ...

    def reset_all_data(self) -> None:
        """Reset all application data"""
        ...

    def enable_fast_mode(self) -> None:
        """Enable fast mode (skip delays)"""
        ...

    def disable_fast_mode(self) -> None:
        """Disable fast mode"""
        ...

    def mock_api_response(self, endpoint: str, response: Dict[str, Any]) -> None:
        """Mock API response for testing"""
        ...

    def clear_mock_responses(self) -> None:
        """Clear all mocked responses"""
        ...

@dataclass
class PerformanceMetric:
    name: str
    value: float
    timestamp: datetime
    tags: Dict[str, str] = None

    def __post_init__(self):
        if self.tags is None:
            self.tags = {}

class PerformanceMonitor(Protocol):
    """Protocol for performance monitoring"""

    def start_timing(self, label: str) -> callable:
        """Start timing operation, returns end function"""
        ...

    def record_metric(self, name: str, value: float, tags: Optional[Dict[str, str]] = None) -> None:
        """Record performance metric"""
        ...

    def get_metrics(self, name: Optional[str] = None) -> List[PerformanceMetric]:
        """Get recorded metrics"""
        ...

    def clear_metrics(self) -> None:
        """Clear all metrics"""
        ...

# ============================================================================
# CONFIGURATION
# ============================================================================

# Default model configurations
MODEL_CONFIGS = {
    AIModel.GEMINI: ModelConfig(
        provider="google",
        model_name="gemini-2.5-flash",
        temperature=0.7,
        max_tokens=8192,
        supports_embeddings=True,
        supports_functions=False
    ),
    AIModel.CLAUDE_SONNET: ModelConfig(
        provider="anthropic",
        model_name="claude-3-5-sonnet-20241022",
        temperature=0.7,
        max_tokens=4096,
        cost_per_token=0.000015,
        supports_functions=True
    ),
    AIModel.CLAUDE_HAIKU: ModelConfig(
        provider="anthropic",
        model_name="claude-3-5-haiku-20241022",
        temperature=0.3,
        max_tokens=4096,
        cost_per_token=0.0000025,
        supports_functions=True
    ),
    AIModel.GPT4: ModelConfig(
        provider="openai",
        model_name="gpt-4",
        temperature=0.7,
        max_tokens=4096,
        cost_per_token=0.00003,
        supports_functions=True
    ),
    AIModel.GPT35_TURBO: ModelConfig(
        provider="openai",
        model_name="gpt-3.5-turbo",
        temperature=0.7,
        max_tokens=4096,
        cost_per_token=0.000002,
        supports_functions=True
    )
}

# Default task-to-model mapping
DEFAULT_TASK_MAPPING = TaskModelMapping()

# ============================================================================
# MIGRATION NOTES
# ============================================================================

"""
DATABASE MIGRATION PATH:
1. Current: In-memory storage in StorageService
2. Phase 1: Supabase integration with these interfaces
3. Phase 2: Full PostgreSQL with complex queries and indexing
4. Phase 3: Redis caching layer for performance

CACHE STRATEGY:
- Demo answers: Cache by question hash for 24 hours
- Story generation: Cache per user until profile changes
- Personalization: Cache personality data for session duration
- API responses: Cache successful responses for 1 hour

MODEL SELECTION LOGIC:
- Demo answers: Fast model (Claude Haiku) for speed
- Complex analysis: Advanced model (Claude Sonnet) for accuracy
- Audio transcription: Specialized model with Whisper API
- Embeddings: Optimized model for semantic similarity

DEV OPTIMIZATION FEATURES:
- Fixture loading for consistent testing
- Mock responses for offline development
- Fast mode to skip animations/delays
- Data export/import for debugging
- Performance monitoring for optimization
"""
