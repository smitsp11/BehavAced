// System Interfaces for Future Implementation
// These interfaces define contracts for DB persistence, caching, model selection, and dev optimizations

// ============================================================================
// DATABASE PERSISTENCE INTERFACES
// ============================================================================

export interface DatabaseConfig {
  type: 'supabase' | 'postgres' | 'mongodb' | 'in-memory'
  connectionString?: string
  schema?: string
  ssl?: boolean
}

export interface UserProfile {
  id: string
  userId: string
  personalitySnapshot?: PersonalitySnapshot
  storyBrain?: StoryBrain
  manualExperience?: ManualExperienceData
  communicationPreferences?: CommunicationPreferences
  onboardingCompleted: boolean
  createdAt: Date
  updatedAt: Date
  lastActiveAt: Date
}

export interface PracticeSession {
  id: string
  userId: string
  question: string
  transcript: string
  audioUrl?: string
  scores: PracticeScores
  feedback: PracticeFeedback
  duration: number
  createdAt: Date
}

export interface StoryBank {
  id: string
  userId: string
  stories: Story[]
  clusters: StoryCluster[]
  embeddingModel: string
  totalStories: number
  createdAt: Date
  updatedAt: Date
}

export interface PracticePlan {
  id: string
  userId: string
  title: string
  description: string
  durationDays: number
  dailyTasks: PracticeTask[]
  targetCompetencies: string[]
  focusAreas: string[]
  progress: PlanProgress
  createdAt: Date
  completedAt?: Date
}

export interface DatabaseAdapter {
  // User Profile Operations
  saveUserProfile(profile: UserProfile): Promise<void>
  getUserProfile(userId: string): Promise<UserProfile | null>
  updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void>

  // Practice Sessions
  savePracticeSession(session: PracticeSession): Promise<void>
  getPracticeSessions(userId: string, limit?: number): Promise<PracticeSession[]>
  getPracticeSession(sessionId: string): Promise<PracticeSession | null>

  // Story Bank
  saveStoryBank(storyBank: StoryBank): Promise<void>
  getStoryBank(userId: string): Promise<StoryBank | null>
  updateStoryBank(userId: string, updates: Partial<StoryBank>): Promise<void>

  // Practice Plans
  savePracticePlan(plan: PracticePlan): Promise<void>
  getPracticePlans(userId: string): Promise<PracticePlan[]>
  updatePracticePlan(planId: string, updates: Partial<PracticePlan>): Promise<void>

  // Analytics
  getUserAnalytics(userId: string): Promise<UserAnalytics>
}

// ============================================================================
// CACHING INTERFACES
// ============================================================================

export interface CacheConfig {
  type: 'memory' | 'redis' | 'file' | 'localStorage'
  ttl?: number // Time to live in seconds
  maxSize?: number // Maximum cache size
  namespace?: string
}

export interface CacheEntry<T = any> {
  key: string
  value: T
  expiresAt?: Date
  metadata?: Record<string, any>
}

export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
  keys(pattern?: string): Promise<string[]>
  size(): Promise<number>
}

// Specific cache interfaces for different data types
export interface DemoAnswerCache {
  getCachedAnswer(question: string, context?: AnswerContext): Promise<DemoAnswer | null>
  setCachedAnswer(question: string, answer: DemoAnswer, context?: AnswerContext): Promise<void>
  clearExpired(): Promise<void>
}

export interface StoryGenerationCache {
  getCachedStories(userId: string): Promise<Story[] | null>
  setCachedStories(userId: string, stories: Story[]): Promise<void>
  invalidateUserStories(userId: string): Promise<void>
}

export interface PersonalizationCache {
  getCachedProfile(userId: string): Promise<PersonalizationProfile | null>
  setCachedProfile(userId: string, profile: PersonalizationProfile): Promise<void>
  updatePersonalityTraits(userId: string, traits: PersonalityTraits[]): Promise<void>
}

// ============================================================================
// MODEL SELECTION INTERFACES
// ============================================================================

export type AIModel = 'gemini' | 'claude-sonnet' | 'claude-haiku' | 'gpt-4' | 'gpt-3.5-turbo'

export interface ModelConfig {
  provider: 'google' | 'anthropic' | 'openai'
  model: string
  temperature: number
  maxTokens: number
  costPerToken?: number
  capabilities: ModelCapabilities
}

export interface ModelCapabilities {
  textGeneration: boolean
  audioTranscription: boolean
  embeddings: boolean
  functionCalling: boolean
  vision?: boolean
}

export interface TaskModelMapping {
  demoAnswer: AIModel
  personalityAnalysis: AIModel
  resumeProcessing: AIModel
  storyGeneration: AIModel
  answerPersonalization: AIModel
  practiceScoring: AIModel
  audioTranscription: AIModel
}

export interface ModelSelector {
  selectModelForTask(task: keyof TaskModelMapping): AIModel
  getModelConfig(model: AIModel): ModelConfig
  updateTaskModel(task: keyof TaskModelMapping, model: AIModel): void
  getAvailableModels(): AIModel[]
  validateModelSupport(model: AIModel, task: string): boolean
}

// ============================================================================
// DEV OPTIMIZATION INTERFACES
// ============================================================================

export interface DevConfig {
  enableCaching: boolean
  enableFixtures: boolean
  mockAIResponses: boolean
  skipOnboarding: boolean
  useLocalStorage: boolean
  enableDebugLogging: boolean
  mockAudioRecording: boolean
  fastMode: boolean // Skip delays and animations
}

export interface FixtureData {
  demoAnswers: Record<string, DemoAnswer>
  personalityProfiles: Record<string, PersonalitySnapshot>
  storyBanks: Record<string, Story[]>
  practiceSessions: Record<string, PracticeSession[]>
  resumeSamples: Record<string, string>
}

export interface DevTools {
  loadFixtures(): Promise<void>
  resetAllData(): Promise<void>
  enableFastMode(): void
  disableFastMode(): void
  mockAPIResponse(endpoint: string, response: any): void
  clearMockResponses(): void
  exportUserData(userId: string): Promise<string>
  importUserData(userId: string, data: string): Promise<void>
}

export interface PerformanceMonitor {
  startTiming(label: string): () => number // Returns end function that returns duration
  recordMetric(name: string, value: number, tags?: Record<string, string>): void
  getMetrics(name?: string): PerformanceMetric[]
  clearMetrics(): void
}

export interface PerformanceMetric {
  name: string
  value: number
  timestamp: Date
  tags?: Record<string, string>
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Re-export types from existing schemas
export type {
  PersonalityTraits,
  CommunicationStyle,
  PersonalitySnapshot,
  ManualExperienceData,
  Story,
  StoryCluster,
  StoryBrain,
  PracticeScores,
  PracticeFeedback,
  DemoAnswer,
  AnswerContext,
  PersonalizationProfile,
} from './models'

// Additional types for system interfaces
export interface CommunicationPreferences {
  preferredStyle: 'direct' | 'narrative' | 'conversational'
  formalityLevel: 'formal' | 'moderate' | 'casual'
  detailLevel: 'high' | 'balanced' | 'concise'
  pacing: 'slow' | 'moderate' | 'fast'
}

export interface PracticeTask {
  id: string
  title: string
  description: string
  type: 'practice' | 'review' | 'reflection' | 'planning'
  duration: number // minutes
  completed: boolean
  completedAt?: Date
  notes?: string
}

export interface PlanProgress {
  completedTasks: number
  totalTasks: number
  currentDay: number
  streakDays: number
  lastCompletedAt?: Date
}

export interface UserAnalytics {
  totalPracticeSessions: number
  averageScore: number
  improvementTrend: number[]
  mostPracticedCompetencies: string[]
  weakestAreas: string[]
  timeSpentPracticing: number // minutes
  streakData: {
    current: number
    longest: number
    lastBreakDate?: Date
  }
}

// ============================================================================
// IMPLEMENTATION NOTES
// ============================================================================

/**
 * DATABASE MIGRATION PATH:
 * 1. Current: In-memory storage in StorageService
 * 2. Phase 1: Supabase integration with these interfaces
 * 3. Phase 2: Full PostgreSQL with complex queries
 * 4. Phase 3: Redis caching layer
 */

/**
 * CACHE STRATEGY:
 * - Demo answers: Cache by question hash for 24 hours
 * - Story generation: Cache per user until profile changes
 * - Personalization: Cache personality data for session duration
 * - API responses: Cache successful responses for 1 hour
 */

/**
 * MODEL SELECTION LOGIC:
 * - Demo answers: Fast model (Claude Haiku) for speed
 * - Complex analysis: Advanced model (Claude Sonnet) for accuracy
 * - Audio transcription: Specialized model with Whisper API
 * - Embeddings: Optimized model for semantic similarity
 */

/**
 * DEV OPTIMIZATION FEATURES:
 * - Fixture loading for consistent testing
 * - Mock responses for offline development
 * - Fast mode to skip animations/delays
 * - Data export/import for debugging
 * - Performance monitoring for optimization
 */
